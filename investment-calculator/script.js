let growthChart = null;

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcInvestment() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const monthly = parseFloat(document.getElementById('monthly').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 7;
    const years = parseInt(document.getElementById('years').value) || 20;
    const freq = parseInt(document.getElementById('freq').value);
    const inflation = parseFloat(document.getElementById('inflation').value) || 2.5;

    const r = rate / 100 / freq;
    const n = freq * years;
    const monthlyR = rate / 100 / 12;

    // Calculate year-by-year growth
    const labels = [];
    const portfolioData = [];
    const investedData = [];

    for (let y = 0; y <= years; y++) {
        const nPeriods = freq * y;
        // FV of lump sum
        const fvLump = principal * Math.pow(1 + r, nPeriods);
        // FV of monthly contributions
        const monthlyPeriods = 12 * y;
        const fvMonthly = monthly > 0
            ? monthly * (Math.pow(1 + monthlyR, monthlyPeriods) - 1) / monthlyR
            : 0;
        const total = fvLump + fvMonthly;
        const invested = principal + monthly * 12 * y;

        labels.push(y === 0 ? 'Now' : 'Year ' + y);
        portfolioData.push(Math.round(total));
        investedData.push(Math.round(invested));
    }

    const finalValue = portfolioData[portfolioData.length - 1];
    const totalInvested = investedData[investedData.length - 1];
    const interestEarned = finalValue - totalInvested;
    const inflationAdjusted = finalValue / Math.pow(1 + inflation / 100, years);

    document.getElementById('final-value').textContent = fmt(finalValue);
    document.getElementById('total-invested').textContent = fmt(totalInvested);
    document.getElementById('total-interest').textContent = fmt(interestEarned);
    document.getElementById('inflation-adj').textContent = fmt(inflationAdjusted);

    document.getElementById('results').classList.add('show');

    if (growthChart) growthChart.destroy();
    const ctx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Portfolio Value',
                    data: portfolioData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.12)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: years > 20 ? 0 : 3
                },
                {
                    label: 'Total Invested',
                    data: investedData,
                    borderColor: '#764ba2',
                    backgroundColor: 'transparent',
                    borderDash: [6, 3],
                    tension: 0.1,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + fmt(ctx.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: v => '$' + (v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v)
                    }
                }
            }
        }
    });
}

function resetInvestment() {
    document.getElementById('results').classList.remove('show');
}
