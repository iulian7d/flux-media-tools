let retireChart = null;
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcRetirement() {
    const curAge = parseInt(document.getElementById('current-age').value) || 35;
    const retireAge = parseInt(document.getElementById('retire-age').value) || 65;
    const savings = parseFloat(document.getElementById('savings').value) || 0;
    const monthly = parseFloat(document.getElementById('contribution').value) || 0;
    const returnRate = parseFloat(document.getElementById('return-rate').value) || 7;
    const retireIncome = parseFloat(document.getElementById('retire-income').value) || 60000;
    const ss = parseFloat(document.getElementById('ss').value) || 0;
    const inflation = parseFloat(document.getElementById('inflation').value) || 2.5;

    const years = retireAge - curAge;
    if (years <= 0) { alert('Retirement age must be greater than current age.'); return; }

    const mr = returnRate / 100 / 12;
    const months = years * 12;
    const fvSavings = savings * Math.pow(1 + mr, months);
    const fvContribs = monthly > 0 ? monthly * (Math.pow(1 + mr, months) - 1) / mr : 0;
    const nestEgg = fvSavings + fvContribs;

    // Future value of desired income (inflation-adjusted)
    const futureIncome = retireIncome * Math.pow(1 + inflation / 100, years);
    const ssAnnual = ss * 12;
    const portfolioIncome = futureIncome - ssAnnual;
    const portfolioNeeded = portfolioIncome / 0.04;
    const sustainableMonthly = (nestEgg * 0.04 + ssAnnual) / 12;

    document.getElementById('nest-egg').textContent = fmt(nestEgg);
    document.getElementById('years-to-retire').textContent = years;
    document.getElementById('monthly-sustainable').textContent = fmt(sustainableMonthly);

    const onTrack = nestEgg >= portfolioNeeded;
    const statusEl = document.getElementById('retirement-status');
    statusEl.textContent = onTrack ? '✅ On Track' : '⚠️ Needs Work';
    statusEl.style.color = onTrack ? '#27ae60' : '#e74c3c';

    const gapBox = document.getElementById('gap-box');
    if (!onTrack) {
        const needed = portfolioNeeded;
        const shortfall = needed - nestEgg;
        const addlMonthly = shortfall / ((Math.pow(1+mr, months)-1) / mr);
        document.getElementById('gap-amount').textContent = fmt(addlMonthly);
        gapBox.style.display = 'block';
    } else {
        gapBox.style.display = 'none';
    }

    // Chart data year-by-year
    const labels = [], vals = [];
    for (let y = 0; y <= years; y++) {
        const m = y * 12;
        const fv = savings * Math.pow(1+mr,m) + (monthly > 0 ? monthly*(Math.pow(1+mr,m)-1)/mr : 0);
        labels.push(curAge + y);
        vals.push(Math.round(fv));
    }

    document.getElementById('results').classList.add('show');
    if (retireChart) retireChart.destroy();
    const ctx = document.getElementById('chart').getContext('2d');
    retireChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Portfolio Value', data: vals, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', fill: true, tension: 0.4, pointRadius: 0 },
                { label: 'Target Needed', data: labels.map(() => Math.round(portfolioNeeded)), borderColor: '#e74c3c', borderDash: [6,3], pointRadius: 0, fill: false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { ticks: { callback: v => '$'+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'K':v) } } }
        }
    });
}
function resetRetirement() { document.getElementById('results').classList.remove('show'); }
