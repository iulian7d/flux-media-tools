let mortgageChart = null;
let loanChart = null;
let ukMortgageChart = null;
let ukLoanChart = null;

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
function fmtGBP(n) { return '£' + Math.round(n).toLocaleString(); }

// ─── COUNTRY & TAB SWITCHING ──────────────────────────────────────────────────
function switchCountry(country) {
    document.getElementById('us-section').style.display = country === 'us' ? '' : 'none';
    document.getElementById('uk-section').style.display = country === 'uk' ? '' : 'none';
    document.getElementById('country-us-btn').classList.toggle('active', country === 'us');
    document.getElementById('country-uk-btn').classList.toggle('active', country === 'uk');
}

function switchTab(tab) {
    document.getElementById('us-tab-mortgage-btn').classList.toggle('active', tab === 'mortgage');
    document.getElementById('us-tab-loan-btn').classList.toggle('active', tab === 'loan');
    document.getElementById('tab-mortgage').classList.toggle('active', tab === 'mortgage');
    document.getElementById('tab-loan').classList.toggle('active', tab === 'loan');
}

function switchUKTab(tab) {
    document.getElementById('uk-tab-afford-btn').classList.toggle('active', tab === 'afford');
    document.getElementById('uk-tab-repay-btn').classList.toggle('active', tab === 'repay');
    document.getElementById('uk-tab-afford').classList.toggle('active', tab === 'afford');
    document.getElementById('uk-tab-repay').classList.toggle('active', tab === 'repay');
}

// ─── US MORTGAGE AFFORDABILITY ────────────────────────────────────────────────
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
    const monthlyInsurance = 100;

    const maxFromFront = monthlyIncome * 0.28 - monthlyTax - monthlyInsurance;
    const maxFromBack = monthlyIncome * 0.36 - debts - monthlyTax - monthlyInsurance;
    const maxPIPayment = Math.min(maxFromFront, maxFromBack);

    let loanAmt;
    if (monthlyRate === 0) { loanAmt = maxPIPayment * n; }
    else { loanAmt = maxPIPayment * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate; }

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
            datasets: [{ data: [Math.round(loanAmt), Math.round(totalInterest), Math.round((monthlyTax + monthlyInsurance) * n)], backgroundColor: ['#667eea', '#764ba2', '#a8b4f8'], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}
function resetMortgage() { document.getElementById('mortgage-results').classList.remove('show'); }

// ─── US LOAN CALCULATOR ───────────────────────────────────────────────────────
function calcLoan() {
    const amount = parseFloat(document.getElementById('l-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('l-rate').value) || 0;
    const years = parseInt(document.getElementById('l-term').value);
    const extra = parseFloat(document.getElementById('l-extra').value) || 0;

    if (amount <= 0) { alert('Please enter a loan amount.'); return; }

    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;
    const basePayment = monthlyRate === 0 ? amount / n : amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalInterestBase = basePayment * n - amount;

    let balance = amount, totalInterestExtra = 0, months = 0;
    const amortData = [], principalArr = [], interestArr = [];

    while (balance > 0.01 && months < n) {
        months++;
        const interestCharge = balance * monthlyRate;
        const principal = Math.min(basePayment + extra - interestCharge, balance);
        balance = Math.max(0, balance - principal);
        totalInterestExtra += interestCharge;
        amortData.push({ month: months, payment: principal + interestCharge, principal, interest: interestCharge, balance });
        if (months <= 60) { principalArr.push(Math.round(principal * 100) / 100); interestArr.push(Math.round(interestCharge * 100) / 100); }
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    document.getElementById('l-monthly').textContent = fmt(basePayment);
    document.getElementById('l-total-interest').textContent = fmt(totalInterestExtra);
    document.getElementById('l-total-cost').textContent = fmt(amount + totalInterestExtra);
    document.getElementById('l-payoff').textContent = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (extra > 0) {
        const saved = totalInterestBase - totalInterestExtra;
        if (saved > 0) {
            document.getElementById('l-savings').textContent = fmt(saved);
            document.getElementById('l-months-early').textContent = n - months;
            document.getElementById('l-savings-box').style.display = 'block';
        }
    } else { document.getElementById('l-savings-box').style.display = 'none'; }

    document.getElementById('amort-table').innerHTML = amortData.map(r =>
        `<tr><td>${r.month}</td><td>${fmt(r.payment)}</td><td>${fmt(r.principal)}</td><td>${fmt(r.interest)}</td><td>${fmt(r.balance)}</td></tr>`
    ).join('');
    document.getElementById('loan-results').classList.add('show');

    if (loanChart) loanChart.destroy();
    const ctx = document.getElementById('loanChart').getContext('2d');
    const labels = amortData.slice(0, 60).map(r => 'Mo ' + r.month);
    loanChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Principal', data: principalArr, backgroundColor: '#667eea', stack: 'a' }, { label: 'Interest', data: interestArr, backgroundColor: '#764ba2', stack: 'a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
}
function resetLoan() { document.getElementById('loan-results').classList.remove('show'); }

// ─── UK STAMP DUTY (England 2024/25) ─────────────────────────────────────────
function calcSDLT(price, buyerType) {
    let bands, surcharge = 0;

    if (buyerType === 'firsttime' && price <= 625000) {
        // First-time buyer relief
        bands = [
            { threshold: 425000, rate: 0 },
            { threshold: 625000, rate: 0.05 }
        ];
    } else {
        bands = [
            { threshold: 250000, rate: 0 },
            { threshold: 925000, rate: 0.05 },
            { threshold: 1500000, rate: 0.10 },
            { threshold: Infinity, rate: 0.12 }
        ];
    }

    if (buyerType === 'additionalprop') surcharge = 0.03;

    let sdlt = 0;
    let prev = 0;
    const breakdown = [];
    for (const band of bands) {
        if (price <= prev) break;
        const taxable = Math.min(price, band.threshold) - prev;
        const tax = taxable * (band.rate + surcharge);
        if (taxable > 0) breakdown.push({ from: prev, to: Math.min(price, band.threshold), rate: (band.rate + surcharge) * 100, tax });
        sdlt += tax;
        prev = band.threshold;
        if (price <= band.threshold) break;
    }
    return { sdlt, breakdown };
}

// ─── UK MORTGAGE AFFORDABILITY ────────────────────────────────────────────────
function calcUKMortgage() {
    const income1 = parseFloat(document.getElementById('uk-income1').value) || 0;
    const income2 = parseFloat(document.getElementById('uk-income2').value) || 0;
    const deposit = parseFloat(document.getElementById('uk-deposit').value) || 0;
    const annualRate = parseFloat(document.getElementById('uk-rate').value) || 4.5;
    const years = parseInt(document.getElementById('uk-term').value);
    const buyerType = document.getElementById('uk-buyer-type').value;

    if (income1 <= 0) { alert('Please enter your annual income.'); return; }

    const totalIncome = income1 + income2;
    const maxBorrow = totalIncome * 4.5;
    const maxPrice = maxBorrow + deposit;
    const ltv = ((maxBorrow / maxPrice) * 100).toFixed(1);

    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;
    const monthlyPayment = monthlyRate === 0 ? maxBorrow / n : maxBorrow * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalInterest = monthlyPayment * n - maxBorrow;

    const { sdlt, breakdown } = calcSDLT(maxPrice, buyerType);

    document.getElementById('uk-max-price').textContent = fmtGBP(maxPrice);
    document.getElementById('uk-borrow').textContent = fmtGBP(maxBorrow);
    document.getElementById('uk-monthly-pay').textContent = fmtGBP(monthlyPayment);
    document.getElementById('uk-ltv').textContent = ltv + '%';
    document.getElementById('uk-sdlt-total').textContent = fmtGBP(sdlt);

    document.getElementById('uk-sdlt-breakdown').innerHTML = breakdown.map(b =>
        `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin:4px 0; color:#555;">
            <span>${fmtGBP(b.from)} – ${b.to === Infinity ? 'above' : fmtGBP(b.to)} @ ${b.rate}%</span>
            <span>${fmtGBP(b.tax)}</span>
        </div>`
    ).join('');

    document.getElementById('uk-afford-results').classList.add('show');

    if (ukMortgageChart) ukMortgageChart.destroy();
    const ctx = document.getElementById('ukMortgageChart').getContext('2d');
    ukMortgageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest', 'Stamp Duty'],
            datasets: [{ data: [Math.round(maxBorrow), Math.round(totalInterest), Math.round(sdlt)], backgroundColor: ['#667eea', '#764ba2', '#f4a261'], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}
function resetUKMortgage() { document.getElementById('uk-afford-results').classList.remove('show'); }

// ─── UK REPAYMENT CALCULATOR ──────────────────────────────────────────────────
function calcUKLoan() {
    const amount = parseFloat(document.getElementById('uk-loan-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('uk-loan-rate').value) || 0;
    const years = parseInt(document.getElementById('uk-loan-term').value);
    const extra = parseFloat(document.getElementById('uk-loan-extra').value) || 0;

    if (amount <= 0) { alert('Please enter a mortgage amount.'); return; }

    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;
    const basePayment = monthlyRate === 0 ? amount / n : amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalInterestBase = basePayment * n - amount;

    let balance = amount, totalInterestExtra = 0, months = 0;
    const amortData = [], principalArr = [], interestArr = [];

    while (balance > 0.01 && months < n) {
        months++;
        const interestCharge = balance * monthlyRate;
        const principal = Math.min(basePayment + extra - interestCharge, balance);
        balance = Math.max(0, balance - principal);
        totalInterestExtra += interestCharge;
        amortData.push({ month: months, payment: principal + interestCharge, principal, interest: interestCharge, balance });
        if (months <= 60) { principalArr.push(Math.round(principal * 100) / 100); interestArr.push(Math.round(interestCharge * 100) / 100); }
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    document.getElementById('uk-l-monthly').textContent = fmtGBP(basePayment);
    document.getElementById('uk-l-interest').textContent = fmtGBP(totalInterestExtra);
    document.getElementById('uk-l-total').textContent = fmtGBP(amount + totalInterestExtra);
    document.getElementById('uk-l-payoff').textContent = payoffDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

    if (extra > 0) {
        const saved = totalInterestBase - totalInterestExtra;
        if (saved > 0) {
            document.getElementById('uk-l-savings').textContent = fmtGBP(saved);
            document.getElementById('uk-l-months-early').textContent = n - months;
            document.getElementById('uk-l-savings-box').style.display = 'block';
        }
    } else { document.getElementById('uk-l-savings-box').style.display = 'none'; }

    document.getElementById('uk-amort-table').innerHTML = amortData.map(r =>
        `<tr><td>${r.month}</td><td>${fmtGBP(r.payment)}</td><td>${fmtGBP(r.principal)}</td><td>${fmtGBP(r.interest)}</td><td>${fmtGBP(r.balance)}</td></tr>`
    ).join('');
    document.getElementById('uk-loan-results').classList.add('show');

    if (ukLoanChart) ukLoanChart.destroy();
    const ctx = document.getElementById('ukLoanChart').getContext('2d');
    const labels = amortData.slice(0, 60).map(r => 'Mo ' + r.month);
    ukLoanChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Principal', data: principalArr, backgroundColor: '#667eea', stack: 'a' }, { label: 'Interest', data: interestArr, backgroundColor: '#764ba2', stack: 'a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
}
function resetUKLoan() { document.getElementById('uk-loan-results').classList.remove('show'); }
