// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

let portfolio = []; // In-memory storage for simplicity

app.post('/add-stock', (req, res) => {
    const { symbol, shares, purchasePrice } = req.body;
    portfolio.push({ symbol, shares, purchasePrice });
    res.send('Stock added to portfolio');
});

app.get('/portfolio', (req, res) => {
    res.json(portfolio);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
