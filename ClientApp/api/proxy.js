const https = require('https');

export default function handler(req, res) {
  const { symbol } = req.query;
  const apiKey = process.env.FINNHUB_API_KEY; // Make sure to set this in Vercel's environment variables

  if (!symbol || !apiKey) {
    res.status(400).json({ error: 'Symbol and API key are required' });
    return;
  }

  const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

  https.get(apiUrl, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      res.status(apiRes.statusCode).json(JSON.parse(data));
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Error fetching data' });
  });
}
