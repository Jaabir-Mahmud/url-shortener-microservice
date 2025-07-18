const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// In-memory store
let urlDatabase = [];
let idCounter = 1;

app.get('/', (req, res) => {
  res.send('URL Shortener Microservice is running...');
});

// POST endpoint to receive a URL
app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;

  try {
    const hostname = urlParser.parse(inputUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = idCounter++;
      urlDatabase[shortUrl] = inputUrl;

      res.json({
        original_url: inputUrl,
        short_url: shortUrl
      });
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// Redirect to original URL
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
