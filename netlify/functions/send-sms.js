const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { phone, ticketId, otp, guestLink } = body;
  if (!phone || !ticketId || !otp || !guestLink) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const FAST2SMS_KEY = '4pCjT1DzWEJZVtXxaAqv9g3lSHN7BnhK802PoeOFdYyismwGLkqYAQGuo3Km5fncSx4Mr7dC6LPZTwOt';
  const cleanPhone = String(phone).replace(/^(\+91|91)/, '').replace(/\D/g, '').slice(-10);

  console.log('SMS request for phone:', cleanPhone, 'ticket:', ticketId);

  if (cleanPhone.length !== 10) {
    console.log('Invalid phone:', phone, '->', cleanPhone);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: 'Invalid phone: ' + phone }) };
  }

  // Strip any spaces that may have crept into the link
  const cleanLink = String(guestLink).replace(/\s/g, '');
  const message = `Valet:Ticket ${ticketId} OTP ${otp} ${cleanLink}`;
  const path = `/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${cleanPhone}`;

  return new Promise((resolve) => {
    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Fast2SMS raw response:', data);
        try {
          const parsed = JSON.parse(data);
          console.log('Fast2SMS parsed:', JSON.stringify(parsed));
          if (parsed.return === true) {
            resolve({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, phone: cleanPhone }) });
          } else {
            resolve({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: parsed.message || data }) });
          }
        } catch(e) {
          console.log('Parse error:', e.message, 'raw:', data);
          resolve({ statusCode: 200, body: JSON.stringify({ success: false, error: 'Parse error: ' + data }) });
        }
      });
    });

    req.on('error', (e) => {
      console.log('HTTPS error:', e.message);
      resolve({ statusCode: 200, body: JSON.stringify({ success: false, error: 'Network error: ' + e.message }) });
    });

    req.setTimeout(8000, () => {
      console.log('Request timed out');
      req.destroy();
      resolve({ statusCode: 200, body: JSON.stringify({ success: false, error: 'Timeout reaching Fast2SMS' }) });
    });

    req.end();
  });
};
