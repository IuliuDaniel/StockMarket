export default async function handler(req, res) {
  const { symbol, from, to, token } = req.query;

  // Check if 'from' and 'to' are present to determine the API endpoint
  const baseUrl = 'https://finnhub.io/api/v1';
  let apiUrl;

  if (from && to) {
    // Company news endpoint
    apiUrl = `${baseUrl}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${token}`;
  } else {
    // Stock quote endpoint
    apiUrl = `${baseUrl}/quote?symbol=${symbol}&token=${token}`;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
