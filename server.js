const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.TOKENHARBOR_API_KEY;
const API_URL = 'https://tokenharbor.ai/v1/chat/completions';

app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            return res.status(response.status).send(
                await response.text()
            );
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }

        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI service error' });
    }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('ACE is running');
});
