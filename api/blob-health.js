// Temporary Preview-only diagnostic. Removed before merge.
const { randomUUID } = require('node:crypto');
const blob = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (process.env.VERCEL_ENV !== 'preview' || req.method !== 'GET') {
    return res.status(404).json({ error: 'Not found' });
  }
  const pathname = `kanbrain/diagnostics/${randomUUID()}.json`;
  try {
    const first = await blob.put(pathname, '{"n":1}', {
      access: 'private', contentType: 'application/json', cacheControlMaxAge: 60
    });
    const read = await blob.get(pathname, { access: 'private', useCache: false });
    const metadata = await blob.head(pathname);
    const body = read && await new Response(read.stream).text();
    let getWrite = 'ok';
    try {
      await blob.put(pathname, '{"n":2}', {
        access: 'private', contentType: 'application/json', cacheControlMaxAge: 60,
        allowOverwrite: true, ifMatch: read.blob.etag
      });
    } catch (error) {
      getWrite = error.constructor.name;
    }
    const nextRead = await blob.get(pathname, { access: 'private', useCache: false });
    const nextBody = nextRead && await new Response(nextRead.stream).text();
    return res.status(200).json({
      firstMatchesGet: first.etag === read?.blob.etag,
      getMatchesHead: read?.blob.etag === metadata.etag,
      getHasEtag: !!read?.blob.etag,
      bodyIsFirst: body === '{"n":1}',
      getWrite,
      nextBodyIsSecond: nextBody === '{"n":2}'
    });
  } catch (error) {
    return res.status(500).json({ error: error.constructor.name });
  } finally {
    await blob.del(pathname).catch(() => {});
  }
};
