let mortgageChart = null;
let loanChart = null;

function fmt(n) {
    return '$' + Math.round(n).toLocaleString();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', (i === 0 && tab === 'mortgage') || (i === 1 && tab === 'loan'));
    });
    document.getElementById('tab-mortgage').classList.toggle('active', tab === 'mortgage');
    document.getElementById('tab-loan').classList.toggle('active', tab === 'loan');
}

function calcMortgage() {
    const income = parseFloat(document.getElementById('m-income').value) || 0;
    const debts = parseFloat(document.getElementById('m-debts').value) || 0;
    const down = parseFloat(document.getElementById('m-down').value) || 0;
    const annualRate = parseFloat(document.getElementById('m-rate').value) || 6.8;
    const years = parseInt(document.getElementById('m-term').value);
    const annualTax = parseFloat(document.getElementById('m-tax').value) || 3000;

    if (income <= 0) { alert('Please enter your annual income.'); return; }

    const monthlyIncome = income / 12;
    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;
    const monthlyTax = annualTax / 12;
    const monthlyInsurance = 100; // estimate

    // Max front-end DTI 28%, back-end 36%
    const maxFromFront = monthlyIncome * 0.28 - monthlyTax - monthlyInsurance;
    const maxFromBack = monthlyIncome * 0.36 - debts - monthlyTax - monthlyInsurance;
    const maxPIPayment = Math.min(maxFromFront, maxFromBack);

    let loanAmt;
    if (monthlyRate === 0) {
        loanAmt = maxPIPayment * n;
    } else {
        loanAmt = maxPIPayment * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate;
    }

    const maxPrice = loanAmt + down;
    const actualMonthly = maxPIPayment + monthlyTax + monthlyInsurance;
    const totalInterest = maxPIPayment * n - loanAmt;
    const dti = ((actualMonthly + debts) / monthlyIncome * 100).toFixed(1);

    document.getElementById('m-max-price').textContent = fmt(maxPrice);
    document.getElementById('m-monthly').textContent = fmt(actualMonthly);
    document.getElementById('m-total-interest').textContent = fmt(totalInterest);
    document.getElementById('m-dti').textContent = dti + '%';

    document.getElementById('mortgage-results').classList.add('show');

    if (mortgageChart) mortgageChart.destroy();
    const ctx = document.getElementById('mortgageChart').getContext('2d');
    mortgageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest', 'Tax & Insurance'],
            datasets: [{
                data: [Math.round(loanAmt), Math.round(totalInterest), Math.round((monthlyTax + monthlyInsurance) * n)],
                backgroundColor: ['#667eea', '#764ba2', '#a8b4f8'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function resetMortgage() {
    document.getElementById('mortgage-results').classList.remove('show');
}

function calcLoan() {
    const amount = parseFloat(document.getElementById('l-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('l-rate').value) || 0;
    const years = parseInt(document.getElementById('l-term').value);
    const extra = parseFloat(document.getElementById('l-extra').value) || 0;

    if (amount <= 0) { alert('Please enter a loan amount.'); return; }

    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;

    let basePayment;
    if (monthlyRate === 0) {
        basePayment = amount / n;
    } else {
        basePayment = amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    const totalBase = basePayment * n;
    const totalInterestBase = totalBase - amount;

    // With extra payments
    let balance = amount;
    let totalInterestExtra = 0;
    let months = 0;
    const amortData = [];
    const principalArr = [], interestArr = [];

    while (balance > 0 && months < n) {
        months++;
        const interestCharge = balance * monthlyRate;
        const payment = Math.min(basePayment + extra, balance + interestCharge);
        const principal = payment - interestCharge;
        balance -= principal;
        totalInterestExtra += interestCharge;
        if (balance < 0) balance = 0;
        amortData.push({ month: months, payment, principal, interest: interestCharge, balance });
        if (months <= 60) { // chart first 5 years
            principalArr.push(Math.round(principal * 100) / 100);
            interestArr.push(Math.round(interestCharge * 100) / 100);
        }
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    document.getElementById('l-monthly').textContent = fmt(basePayment + extra > basePayment ? basePayment : basePayment);
    document.getElementById('l-monthly').textContent = fmt(basePayment);
    document.getElementById('l-total-interest').textContent = fmt(totalInterestExtra);
    document.getElementById('l-total-cost').textContent = fmt(amount + totalInterestExtra);
    document.getElementById('l-payoff').textContent = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (extra > 0) {
        const saved = totalInterestBase - totalInterestExtra;
        const monthsEarly = n - months;
        if (saved > 0) {
            document.getElementById('l-savings').textContent = fmt(saved);
            document.getElementById('l-months-early').textContent = monthsEarly;
            document.getElementById('l-savings-box').style.display = 'block';
        }
    } else {
        document.getElementById('l-savings-box').style.display = 'none';
    }

    // Amortization table
    const tbody = document.getElementById('amort-table');
    tbody.innerHTML = amortData.map(r =>
        `<tr><td>${r.month}</td><td>${fmt(r.payment)}</td><td>${fmt(r.principal)}</td><td>${fmt(r.interest)}</td><td>${fmt(r.balance)}</td></tr>`
    ).join('');

    document.getElementById('loan-results').classList.add('show');

    if (loanChart) loanChart.destroy();
    const ctx = document.getElementById('loanChart').getContext('2d');
    const labels = amortData.slice(0, Math.min(60, amortData.length)).map(r => 'Mo ' + r.month);
    loanChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Principal', data: principalArr, backgroundColor: '#667eea', stack: 'a' },
                { label: 'Interest', data: interestArr, backgroundColor: '#764ba2', stack: 'a' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true } }
        }
    });
}

function resetLoan() {
    document.getElementById('loan-results').classList.remove('show');
}
