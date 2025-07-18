const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Homepage (optional)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// In-memory database
let urls = [];
let id = 1;

// POST: Shorten URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  // ✅ Regex: Must start with http:// or https://
  const urlPattern = /^https?:\/\/[^ "]+$/;
  if (!urlPattern.test(original_url)) {
    return res.json({ error: 'invalid url' });
  }

  // ✅ Parse and lookup DNS
  const hostname = urlParser.parse(original_url).hostname;

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Save and respond
    const short_url = id++;
    urls.push({ original_url, short_url });
    res.json({ original_url, short_url });
  });
});

// GET: Redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const entry = urls.find(item => item.short_url === short_url);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
