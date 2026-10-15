const blob = require('@vercel/blob');

function createStore(client = blob) {
  function pathname(boardId) {
    const environment = process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
    return `kanbrain/planning/v1/${environment}/${boardId}.json`;
  }

  async function read(boardId) {
    const result = await client.get(pathname(boardId), { access: 'private', useCache: false });
    if (!result) return { assignments: [], etag: null };
    const document = JSON.parse(await new Response(result.stream).text());
    if (document.version !== 1 || !Array.isArray(document.assignments)) {
      throw new Error('Invalid planning document');
    }
    return { assignments: document.assignments, etag: result.blob.etag };
  }

  async function update(boardId, change) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await read(boardId);
      const next = change(current.assignments);
      try {
        await client.put(pathname(boardId), JSON.stringify({ version: 1, assignments: next.assignments }), {
          access: 'private', contentType: 'application/json', cacheControlMaxAge: 60,
          allowOverwrite: !!current.etag,
          ...(current.etag ? { ifMatch: current.etag } : {})
        });
        return next.result;
      } catch (e) {
        if (current.etag && e instanceof client.BlobPreconditionFailedError) continue;
        // Two admins can create the first document simultaneously. Retry only
        // if another writer actually created it; otherwise surface the error.
        if (!current.etag && (await read(boardId)).etag) continue;
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
