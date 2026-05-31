let loanChart = null;
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcLoan() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('rate').value) || 0;
    const years = parseInt(document.getElementById('term').value);
    const extra = parseFloat(document.getElementById('extra').value) || 0;
    if (amount <= 0) { alert('Please enter a loan amount.'); return; }

    const mr = annualRate / 100 / 12;
    const n = years * 12;
    const base = mr > 0 ? amount * mr * Math.pow(1+mr,n) / (Math.pow(1+mr,n)-1) : amount/n;
    const baseTotal = base * n;
    const baseInterest = baseTotal - amount;

    let bal = amount, totalInt = 0, months = 0;
    const rows = [], pArr = [], iArr = [];
    while (bal > 0.01 && months < n + 1) {
        months++;
        const intCharge = bal * mr;
        const pmt = Math.min(base + extra, bal + intCharge);
        const prin = pmt - intCharge;
        bal = Math.max(0, bal - prin);
        totalInt += intCharge;
        rows.push({ month: months, pmt, prin, intCharge, bal });
        if (months <= 60) { pArr.push(+prin.toFixed(2)); iArr.push(+intCharge.toFixed(2)); }
    }

    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + months);

    document.getElementById('monthly').textContent = fmt(base);
    document.getElementById('total-interest').textContent = fmt(totalInt);
    document.getElementById('total-cost').textContent = fmt(amount + totalInt);
    document.getElementById('payoff').textContent = payoff.toLocaleDateString('en-US',{month:'short',year:'numeric'});

    const sb = document.getElementById('savings-box');
    if (extra > 0 && baseInterest - totalInt > 1) {
        document.getElementById('savings').textContent = fmt(baseInterest - totalInt);
        document.getElementById('early').textContent = n - months;
        sb.style.display = 'block';
    } else sb.style.display = 'none';

    document.getElementById('table').innerHTML = rows.map(r =>
        `<tr><td>${r.month}</td><td>${fmt(r.pmt)}</td><td>${fmt(r.prin)}</td><td>${fmt(r.intCharge)}</td><td>${fmt(r.bal)}</td></tr>`
    ).join('');

    document.getElementById('results').classList.add('show');
    if (loanChart) loanChart.destroy();
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = rows.slice(0, pArr.length).map(r => 'Mo '+r.month);
    loanChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Principal', data: pArr, backgroundColor: '#667eea', stack: 'a' },
                { label: 'Interest', data: iArr, backgroundColor: '#764ba2', stack: 'a' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
}
function resetLoan() { document.getElementById('results').classList.remove('show'); }
