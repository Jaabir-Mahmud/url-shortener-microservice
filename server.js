const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const urlParser = require('url');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory "DB"
const urls = [];

app.get('/', (req, res) => {
  res.send('URL Shortener is running...');
});

app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  // Validate using dns.lookup
  const hostname = urlParser.parse(original_url).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const short_url = urls.length + 1;
      urls.push({ original_url, short_url });
      res.json({ original_url, short_url });
    }
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry = urls.find(u => u.short_url === short);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
