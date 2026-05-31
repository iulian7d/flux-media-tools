// 2025 Federal tax brackets
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

// State flat rates (approximate 2025)
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
        { name: 'Gross Annual Salary', val: fmt(gross), cls: '' },
        { name: `Federal Income Tax (${pct(federalTax/gross)})`, val: '−' + fmt(federalTax), cls: '' },
        { name: `State Tax — ${state} (${pct(stateTax[state] || 0)})`, val: '−' + fmt(stateTaxAmt), cls: '' },
        { name: `Social Security (6.2%)`, val: '−' + fmt(socialSecurity), cls: '' },
        { name: `Medicare (1.45%)`, val: '−' + fmt(medicare + additionalMedicare), cls: '' },
        { name: `401(k) Contribution (${k401Pct}%)`, val: '−' + fmt(k401), cls: '' },
        { name: 'Total Deductions', val: fmt(totalDeductions), cls: '' },
        { name: 'Net Annual Take-Home', val: fmt(netAnnual), cls: 'total' }
    ];

    document.getElementById('tax-breakdown').innerHTML = rows.map(r =>
        `<div class="tax-row ${r.cls}"><span class="tax-name">${r.name}</span><span class="tax-val">${r.val}</span></div>`
    ).join('');

    document.getElementById('results').classList.add('show');
}

function resetSalary() {
    document.getElementById('results').classList.remove('show');
}
