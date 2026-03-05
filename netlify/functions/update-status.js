exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { ticketId, status, scheduledTime } = body;
  if (!ticketId || !status) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing ticketId or status' }) };
  }

  const validStatuses = ['requesting', 'scheduled'];
  if (!validStatuses.includes(status)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid status' }) };
  }

  const FIREBASE_DB_URL = 'https://valet-7bf14-default-rtdb.firebaseio.com';
  const updateData = { status };
  if (scheduledTime) updateData.scheduledTime = scheduledTime;

  try {
    const res = await fetch(`${FIREBASE_DB_URL}/cars/${ticketId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'Firebase error', detail: txt }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
