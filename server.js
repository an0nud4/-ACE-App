const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const API_KEY = process.env.TOKENHARBOR_API_KEY;
const API_URL = 'https://tokenharbor.ai/v1/chat/completions';

app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        error: 'API key is not configured'
      });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json(err);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();

  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error'
      });
    } else {
      res.end();
    }
  }
});

app.listen(3000, '127.0.0.1', () => {
  console.log('ACE Proxy running at http://127.0.0.1:3000');
});
