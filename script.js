// Updated script.js
const stockForm = document.getElementById('stock-form');
const portfolioBody = document.getElementById('portfolio-body');
const portfolioChart = document.getElementById('portfolio-chart').getContext('2d');
let portfolio = [];

stockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const shares = parseFloat(document.getElementById('shares').value);
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value);

    await fetch('/add-stock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, shares, purchasePrice }),
    });

    await loadPortfolio();
});

async function loadPortfolio() {
    const response = await fetch('/portfolio');
    portfolio = await response.json();
    updatePortfolioTable();
    updateChart();
}

function updatePortfolioTable() {
    portfolioBody.innerHTML = '';
    portfolio.forEach(stock => {
        const row = `<tr>
            <td>${stock.symbol}</td>
            <td>${stock.shares}</td>
            <td>$${stock.purchasePrice.toFixed(2)}</td>
            <td>$${stock.currentPrice ? stock.currentPrice.toFixed(2) : 'Loading...'}</td>
            <td>${stock.currentPrice ? `$${(stock.shares * stock.currentPrice).toFixed(2)}` : 'Loading...'}</td>
        </tr>`;
        portfolioBody.insertAdjacentHTML('beforeend', row);
    });
    updateCurrentPrices();
}

async function updateCurrentPrices() {
    for (let stock of portfolio) {
        if (!stock.currentPrice) {
            stock.currentPrice = await getCurrentPrice(stock.symbol);
        }
    }
    updatePortfolioTable();
    updateChart();
}

async function getCurrentPrice(symbol) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const data = await response.json();
        return data.chart.result[0].meta.regularMarketPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return 0;
    }
}

function updateChart() {
    const labels = portfolio.map(stock => stock.symbol);
    const data = portfolio.map(stock => stock.shares * (stock.currentPrice || 0));

    new Chart(portfolioChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

loadPortfolio();
