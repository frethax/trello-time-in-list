const planning = require('../resource-planning');
const store = require('./planning-store');

const ID = /^[0-9a-f]{24}$/i;
const TRELLO = 'https://api.trello.com/1';

function error(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function trello(path, token) {
  const url = new URL(TRELLO + path);
  url.searchParams.set('key', process.env.TRELLO_API_KEY);
  url.searchParams.set('token', token);
  const response = await fetch(url);
  if (response.status === 401 || response.status === 403) throw error(403, 'Trello access denied');
  if (!response.ok) throw error(502, 'Trello is unavailable');
  return response.json();
}

function send(res, status, data) { res.status(status).json(data); }

async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization');
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return send(res, 405, { error: 'Method not allowed' });
  }
  try {
    if (!process.env.TRELLO_API_KEY ||
        (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN)) {
      throw error(503, 'Planning is not configured');
    }
    const boardId = req.query.boardId;
    if (typeof boardId !== 'string' || !ID.test(boardId)) throw error(400, 'Invalid board');
    const header = req.headers.authorization || '';
    const token = /^Bearer ([^\s]{20,256})$/.exec(header)?.[1];
    if (!token) throw error(401, 'Trello sign-in required');

    // Verify identity and current board role on every request, including reads.
    const [viewer, memberships] = await Promise.all([
      trello('/members/me?fields=id', token),
      trello('/boards/' + boardId + '/memberships?filter=all', token)
    ]);
    if (!Array.isArray(memberships) || !memberships.some(m =>
      m.idMember === viewer.id && m.memberType === 'admin' && !m.unconfirmed)) {
      throw error(403, 'Board admin access required');
    }

    if (req.method === 'GET') {
      const cardId = req.query.cardId;
      if (cardId && (typeof cardId !== 'string' || !ID.test(cardId))) throw error(400, 'Invalid card');
      const [stored, members, cards] = await Promise.all([
        store.read(boardId),
        trello('/boards/' + boardId + '/members?fields=id,fullName,username', token),
        cardId ? Promise.resolve(null) : trello('/boards/' + boardId + '/cards/all?fields=id,name,shortUrl,closed', token)
      ]);
      const currentCards = new Map((cards || []).map(c => [c.id, c]));
      const assignments = stored.assignments.filter(a => !cardId || a.cardId === cardId).map(a => {
        const card = currentCards.get(a.cardId);
        return cardId ? a : { ...a, archived: !card || !!card.closed,
          cardName: card ? card.name : a.cardName,
          cardUrl: card ? card.shortUrl : a.cardUrl };
      });
      return send(res, 200, { assignments,
        members: members.map(m => ({ id: m.id, name: m.fullName || m.username || m.id })) });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (req.method === 'DELETE' || req.method === 'PUT') {
      if (typeof body.id !== 'string' ||
          !/^(?:[0-9a-f]{24}:[0-9a-f]{24}|[0-9a-f-]{36})$/i.test(body.id)) {
        throw error(400, 'Invalid assignment');
      }
      const stored = await store.read(boardId);
      var previous = stored.assignments.find(a => a.id === body.id);
      if (!previous) throw error(404, 'Assignment not found');
      if (req.method === 'DELETE') {
        await store.update(boardId, assignments => {
          if (!assignments.some(a => a.id === body.id)) throw error(404, 'Assignment not found');
          return { assignments: assignments.filter(a => a.id !== body.id) };
        });
        return send(res, 200, { deleted: true });
      }
    }
    const cardId = req.method === 'PUT' ? previous.cardId : body.cardId;
    const memberId = req.method === 'PUT' ? previous.memberId : body.memberId;
    const dates = planning.normalizeDates(body.dates);
    if (typeof cardId !== 'string' || !ID.test(cardId) ||
        typeof memberId !== 'string' || !ID.test(memberId) || !dates ||
        (req.method === 'PUT' && body.memberId && body.memberId !== memberId)) {
      throw error(400, 'Choose a board member and one or more weekdays');
    }
    const [card, members] = await Promise.all([
      trello('/cards/' + cardId + '?fields=idBoard,name,shortUrl,closed', token),
      trello('/boards/' + boardId + '/members?fields=id', token)
    ]);
    if (card.idBoard !== boardId || card.closed) throw error(400, 'Card is not open on this board');
    if (!members.some(m => m.id === memberId)) throw error(400, 'Member is not on this board');
    const assignment = { id: req.method === 'PUT' ? previous.id : cardId + ':' + memberId,
      cardId, cardName: card.name, cardUrl: card.shortUrl,
      memberId, dates };
    await store.update(boardId, assignments => {
      const index = assignments.findIndex(a => a.id === assignment.id);
      if (req.method === 'POST') {
        if (index !== -1) throw error(409, 'This member already has a plan on this card; edit it instead');
        return { assignments: [...assignments, assignment] };
      }
      if (index === -1) throw error(404, 'Assignment not found');
      if (JSON.stringify(assignments[index]) !== JSON.stringify(previous)) {
        throw error(409, 'Planning changed; please reload and try again');
      }
      const updated = assignments.slice();
      updated[index] = assignment;
      return { assignments: updated };
    });
    return send(res, req.method === 'POST' ? 201 : 200, { assignment });
  } catch (e) {
    // Never return tokens, Trello URLs or storage credentials in errors.
    return send(res, e.status || 500, { error: e.status ? e.message : 'Planning request failed' });
  }
}

module.exports = handler;
