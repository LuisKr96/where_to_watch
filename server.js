const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const countries = require('i18n-iso-countries');
require('dotenv').config();

const app     = express();
const PORT    = 3000;
const API_URL = 'https://api.football-data.org/v4';

app.use(cors());
app.use(express.static('.'));

app.get('/api/countries', (req, res) => {
  const names = countries.getNames('en', { select: 'official' });
  const result = Object.entries(names).map(([code, name]) => ({
    code: code.toLowerCase(),
    name,
    flag: getFlagEmoji(code)
  }));
  res.json(result.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/matches', async (req, res) => {
  const { competition, dateFrom, dateTo } = req.query;

  if (!competition) {
    return res.status(400).json({ error: 'competition parameter required' });
  }

  try {
    const url = `${API_URL}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`;
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': process.env.API_TOKEN }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

function getFlagEmoji(countryCode) {
  const code = countryCode.toUpperCase();
  return [...code].map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});