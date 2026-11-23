const blob = require('@vercel/blob');

function createStore(client = blob) {
  function pathname(boardId) {
    const environment = process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
    return `kanbrain/planning/v1/${environment}/${boardId}.json`;
  }

  // Vercel bills HEAD calls and CDN cache MISSes as Simple Operations; cache
  // HITs are free. Display reads use the CDN cache (overwrites propagate
  // within ~60s). Only writes and post-save refreshes bypass it.
  async function read(boardId, { fresh = false } = {}) {
    const result = await client.get(pathname(boardId), { access: 'private', useCache: !fresh });
    if (!result) return { assignments: [], etag: null, exists: false };
    const document = JSON.parse(await new Response(result.stream).text());
    if (document.version !== 1 || !Array.isArray(document.assignments)) {
      throw new Error('Invalid planning document');
    }
    return { assignments: document.assignments, etag: result.blob.etag, exists: true,
      cacheControl: result.blob.cacheControl || '' };
  }

  async function metadata(boardId) {
    try {
      return await client.head(pathname(boardId));
    } catch (error) {
      if (error instanceof client.BlobNotFoundError) return null;
      throw error;
    }
  }

  async function stableRead(boardId) {
    // GET serves the document; HEAD supplies the ETag used by conditional PUT.
    // Bracket the origin read so an intervening write cannot pair old content
    // with a newer ETag and accidentally overwrite another admin's changes.
    const before = await metadata(boardId);
    const current = await read(boardId, { fresh: true });
    const after = await metadata(boardId);
    if (before?.etag !== after?.etag || current.exists !== !!after?.etag) return null;
    return { assignments: current.assignments, etag: after?.etag || null };
  }

  async function update(boardId, change) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await stableRead(boardId);
      if (!current) {
        if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 25 * (attempt + 1)));
        continue;
      }
      const next = change(current.assignments);
      try {
        await client.put(pathname(boardId), JSON.stringify({ version: 1, assignments: next.assignments }), {
          access: 'private', contentType: 'application/json',
          allowOverwrite: !!current.etag,
          ...(current.etag ? { ifMatch: current.etag } : {})
        });
        return next.result;
      } catch (e) {
        if (current.etag && e instanceof client.BlobPreconditionFailedError) {
          if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 25 * (attempt + 1)));
          continue;
        }
        // Two admins can create the first document simultaneously. Retry only
        // if another writer actually created it; otherwise surface the error.
        if (!current.etag && (await read(boardId, { fresh: true })).etag) continue;
        throw e;
      }
    }
    const conflict = new Error('Planning changed; please try again');
    conflict.status = 409;
    throw conflict;
  }

  return { read, update };
}

module.exports = createStore();
module.exports.createStore = createStore;
