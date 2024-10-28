// proxy.js
export default async (req, res) => {
  const { symbol } = req.query;
  const apiKey = 'csbs4ghr01qgt32eoptgcsbs4ghr01qgt32eopu0'; // Directly hardcoded API key

  if (!symbol) {
    return res.status(400).json({ error: "Symbol is required" });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
    if (!response.ok) {
      throw new Error("Failed to fetch from Finnhub");
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
