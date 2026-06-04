// ─── COUNTRY SWITCH ───────────────────────────────────────────────────────────
function switchCountry(country) {
    document.getElementById('us-section').style.display = country === 'us' ? '' : 'none';
    document.getElementById('uk-section').style.display = country === 'uk' ? '' : 'none';
    document.getElementById('tab-us-btn').classList.toggle('active', country === 'us');
    document.getElementById('tab-uk-btn').classList.toggle('active', country === 'uk');
}

// ─── US CALCULATOR ────────────────────────────────────────────────────────────
const federalBrackets = {
    single: [
        { rate: 0.10, min: 0, max: 11600 },
        { rate: 0.12, min: 11600, max: 47150 },
        { rate: 0.22, min: 47150, max: 100525 },
        { rate: 0.24, min: 100525, max: 191950 },
        { rate: 0.32, min: 191950, max: 243725 },
        { rate: 0.35, min: 243725, max: 609350 },
        { rate: 0.37, min: 609350, max: Infinity }
    ],
    married: [
        { rate: 0.10, min: 0, max: 23200 },
        { rate: 0.12, min: 23200, max: 94300 },
        { rate: 0.22, min: 94300, max: 201050 },
        { rate: 0.24, min: 201050, max: 383900 },
        { rate: 0.32, min: 383900, max: 487450 },
        { rate: 0.35, min: 487450, max: 731200 },
        { rate: 0.37, min: 731200, max: Infinity }
    ],
    hoh: [
        { rate: 0.10, min: 0, max: 16550 },
        { rate: 0.12, min: 16550, max: 63100 },
        { rate: 0.22, min: 63100, max: 100500 },
        { rate: 0.24, min: 100500, max: 191950 },
        { rate: 0.32, min: 191950, max: 243700 },
        { rate: 0.35, min: 243700, max: 609350 },
        { rate: 0.37, min: 609350, max: Infinity }
    ]
};

const standardDeduction = { single: 14600, married: 29200, hoh: 21900 };

const stateTax = {
    AL: 0.05, AK: 0, AZ: 0.025, AR: 0.047, CA: 0.093, CO: 0.044, CT: 0.065,
    DE: 0.066, FL: 0, GA: 0.055, HI: 0.11, ID: 0.058, IL: 0.0495, IN: 0.0305,
    IA: 0.06, KS: 0.057, KY: 0.045, LA: 0.042, ME: 0.075, MD: 0.0575, MA: 0.09,
    MI: 0.0425, MN: 0.0985, MS: 0.05, MO: 0.054, MT: 0.069, NE: 0.0664,
    NV: 0, NH: 0, NJ: 0.0637, NM: 0.059, NY: 0.0685, NC: 0.0475, ND: 0.025,
    OH: 0.04, OK: 0.05, OR: 0.099, PA: 0.0307, RI: 0.0599, SC: 0.07,
    SD: 0, TN: 0, TX: 0, UT: 0.0465, VT: 0.0875, VA: 0.0575, WA: 0,
    WV: 0.065, WI: 0.0765, WY: 0
};

function calcTax(income, filing) {
    const brackets = federalBrackets[filing];
    const deduction = standardDeduction[filing];
    const taxableIncome = Math.max(0, income - deduction);
    let tax = 0;
    for (const b of brackets) {
        if (taxableIncome <= b.min) break;
        const taxable = Math.min(taxableIncome, b.max) - b.min;
        tax += taxable * b.rate;
    }
    return tax;
}

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
function pct(n) { return (n * 100).toFixed(1) + '%'; }

function calcSalary() {
    const gross = parseFloat(document.getElementById('salary').value) || 0;
    const state = document.getElementById('state').value;
    const filing = document.getElementById('filing').value;
    const k401Pct = parseFloat(document.getElementById('k401').value) || 0;

    if (gross <= 0) { alert('Please enter your salary.'); return; }

    const k401 = gross * (k401Pct / 100);
    const grossAfterK401 = gross - k401;

    const federalTax = calcTax(grossAfterK401, filing);
    const stateTaxAmt = grossAfterK401 * (stateTax[state] || 0);
    const socialSecurity = Math.min(gross, 168600) * 0.062;
    const medicare = gross * 0.0145;
    const additionalMedicare = gross > 200000 ? (gross - 200000) * 0.009 : 0;

    const totalDeductions = federalTax + stateTaxAmt + socialSecurity + medicare + additionalMedicare + k401;
    const netAnnual = gross - totalDeductions;

    document.getElementById('net-annual').textContent = fmt(netAnnual);
    document.getElementById('net-monthly').textContent = fmt(netAnnual / 12);
    document.getElementById('net-biweekly').textContent = fmt(netAnnual / 26);
    document.getElementById('net-hourly').textContent = '$' + (netAnnual / 2080).toFixed(2);

    const rows = [
        { name: 'Gross Annual Salary', val: fmt(gross) },
        { name: `Federal Income Tax (${pct(federalTax/gross)})`, val: '−' + fmt(federalTax) },
        { name: `State Tax — ${state} (${pct(stateTax[state] || 0)})`, val: '−' + fmt(stateTaxAmt) },
        { name: 'Social Security (6.2%)', val: '−' + fmt(socialSecurity) },
        { name: `Medicare (1.45%)`, val: '−' + fmt(medicare + additionalMedicare) },
        { name: `401(k) Contribution (${k401Pct}%)`, val: '−' + fmt(k401) },
        { name: 'Total Deductions', val: fmt(totalDeductions) },
        { name: 'Net Annual Take-Home', val: fmt(netAnnual), cls: 'total' }
    ];

    document.getElementById('tax-breakdown').innerHTML = rows.map(r =>
        `<div class="tax-row ${r.cls||''}"><span class="tax-name">${r.name}</span><span class="tax-val">${r.val}</span></div>`
    ).join('');

    document.getElementById('results').classList.add('show');
}

function resetSalary() {
    document.getElementById('results').classList.remove('show');
}

// ─── UK CALCULATOR ────────────────────────────────────────────────────────────
// 2024/25 UK tax bands — England/Wales/NI
const ukBracketsEngland = [
    { rate: 0,    min: 0,       max: 12570  },  // Personal Allowance
    { rate: 0.20, min: 12570,   max: 50270  },  // Basic rate
    { rate: 0.40, min: 50270,   max: 125140 },  // Higher rate
    { rate: 0.45, min: 125140,  max: Infinity } // Additional rate
];

// 2024/25 Scotland income tax bands
const ukBracketsScotland = [
    { rate: 0,    min: 0,       max: 12570  },  // Personal Allowance
    { rate: 0.19, min: 12570,   max: 14876  },  // Starter rate
    { rate: 0.20, min: 14876,   max: 26561  },  // Basic rate
    { rate: 0.21, min: 26561,   max: 43662  },  // Intermediate rate
    { rate: 0.42, min: 43662,   max: 75000  },  // Higher rate
    { rate: 0.45, min: 75000,   max: 125140 },  // Advanced rate
    { rate: 0.48, min: 125140,  max: Infinity } // Top rate
];

// National Insurance 2024/25
// Primary threshold £12,570, Upper Earnings Limit £50,270
function calcNI(gross) {
    const PT = 12570;
    const UEL = 50270;
    let ni = 0;
    if (gross > PT) {
        ni += Math.min(gross, UEL) - PT;  // 8% band
        ni = (Math.min(gross, UEL) - PT) * 0.08;
    }
    if (gross > UEL) {
        ni += (gross - UEL) * 0.02;
    }
    return ni;
}

// UK Income Tax with Personal Allowance taper above £100,000
function calcUKIncomeTax(gross, region) {
    const brackets = region === 'scotland' ? ukBracketsScotland : ukBracketsEngland;
    // Taper personal allowance: £1 lost per £2 over £100,000
    let personalAllowance = 12570;
    if (gross > 100000) {
        personalAllowance = Math.max(0, 12570 - Math.floor((gross - 100000) / 2));
    }
    let tax = 0;
    for (let i = 0; i < brackets.length; i++) {
        const b = brackets[i];
        // Shift all thresholds by the change in personal allowance
        const shift = 12570 - personalAllowance;
        const adjMin = Math.max(0, b.min - shift);
        const adjMax = b.max === Infinity ? Infinity : Math.max(0, b.max - shift);
        if (gross <= adjMin) break;
        const taxable = Math.min(gross, adjMax) - adjMin;
        tax += taxable * b.rate;
    }
    return tax;
}

// Student loan repayments
const loanThresholds = {
    plan1: { threshold: 24990, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 31395, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    pg:    { threshold: 21000, rate: 0.06 }
};

function fmtGBP(n) { return '£' + Math.round(n).toLocaleString(); }
function pctStr(n) { return (n * 100).toFixed(1) + '%'; }

function calcSalaryUK() {
    const gross = parseFloat(document.getElementById('uk-salary').value) || 0;
    const region = document.getElementById('uk-region').value;
    const pensionPct = parseFloat(document.getElementById('uk-pension').value) || 0;
    const loanPlan = document.getElementById('uk-loan').value;

    if (gross <= 0) { alert('Please enter your salary.'); return; }

    // Pension (relief at source — reduces gross for tax/NI)
    const pension = gross * (pensionPct / 100);
    const grossAfterPension = gross - pension;

    // Income Tax
    const incomeTax = calcUKIncomeTax(grossAfterPension, region);

    // National Insurance
    const ni = calcNI(grossAfterPension);

    // Student Loan
    let studentLoan = 0;
    if (loanPlan !== 'none' && loanThresholds[loanPlan]) {
        const { threshold, rate } = loanThresholds[loanPlan];
        if (gross > threshold) studentLoan = (gross - threshold) * rate;
    }

    const totalDeductions = incomeTax + ni + pension + studentLoan;
    const netAnnual = gross - totalDeductions;

    document.getElementById('uk-net-annual').textContent = fmtGBP(netAnnual);
    document.getElementById('uk-net-monthly').textContent = fmtGBP(netAnnual / 12);
    document.getElementById('uk-net-weekly').textContent = fmtGBP(netAnnual / 52);
    document.getElementById('uk-net-hourly').textContent = '£' + (netAnnual / 1950).toFixed(2);

    const regionLabel = region === 'scotland' ? 'Scotland' : 'England/Wales/NI';
    const rows = [
        { name: 'Gross Annual Salary', val: fmtGBP(gross) },
        { name: `Income Tax — ${regionLabel} (${pctStr(incomeTax/gross)})`, val: '−' + fmtGBP(incomeTax) },
        { name: `National Insurance (${pctStr(ni/gross)})`, val: '−' + fmtGBP(ni) },
        { name: `Pension Contribution (${pensionPct}%)`, val: '−' + fmtGBP(pension) },
        { name: loanPlan !== 'none' ? `Student Loan (${loanPlan.toUpperCase()})` : 'Student Loan', val: '−' + fmtGBP(studentLoan) },
        { name: 'Total Deductions', val: fmtGBP(totalDeductions) },
        { name: 'Net Annual Take-Home', val: fmtGBP(netAnnual), cls: 'total' }
    ];

    document.getElementById('uk-tax-breakdown').innerHTML = rows.map(r =>
        `<div class="tax-row ${r.cls||''}"><span class="tax-name">${r.name}</span><span class="tax-val">${r.val}</span></div>`
    ).join('');

    document.getElementById('uk-results').classList.add('show');
}

function resetSalaryUK() {
    document.getElementById('uk-results').classList.remove('show');
}
