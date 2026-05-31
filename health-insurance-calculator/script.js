// 2025 Federal Poverty Level guidelines
const fplBase = { 1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960, 7: 47340, 8: 52720 };

// Average benchmark silver plan premiums by age (national avg 2025)
function getBasePremium(age, costFactor) {
    let base;
    if (age < 21) base = 260;
    else if (age < 30) base = 320;
    else if (age < 40) base = 380;
    else if (age < 50) base = 520;
    else if (age < 60) base = 750;
    else base = 950;
    const factors = { avg: 1.0, high: 1.35, low: 0.75 };
    return base * (factors[costFactor] || 1.0);
}

const planMultipliers = { bronze: 0.72, silver: 1.0, gold: 1.22, platinum: 1.45 };
const planDeductibles = { bronze: '$7,500', silver: '$3,000', gold: '$1,500', platinum: '$0' };
const planOOP = { bronze: '$9,450', silver: '$7,500', gold: '$5,000', platinum: '$2,500' };
const planCoinsurance = { bronze: '40%', silver: '30%', gold: '20%', platinum: '10%' };

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcInsurance() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const household = Math.min(8, parseInt(document.getElementById('household').value) || 1);
    const age = parseInt(document.getElementById('age').value) || 35;
    const state = document.getElementById('state').value;
    const plan = document.getElementById('plan').value;
    const employer = document.getElementById('employer').value;

    if (income <= 0) { alert('Please enter your household income.'); return; }

    const fpl = fplBase[household] || (fplBase[8] + (household - 8) * 4480);
    const fplPct = (income / fpl) * 100;
    const silverPremium = getBasePremium(age, state);
    const selectedPremium = silverPremium * planMultipliers[plan];

    // ACA subsidy calculation (simplified)
    let subsidy = 0;
    let subsidyNote = '';

    if (employer === 'yes') {
        subsidyNote = `<div style="background:#fff8f0; border-left:3px solid #f4a261; padding:14px; border-radius:8px; font-size:0.9rem;">⚠️ Since you have access to employer coverage, you generally cannot receive marketplace subsidies unless the employer plan is unaffordable (costs more than 9.12% of your income for employee-only coverage). Consult a broker for your specific situation.</div>`;
    } else if (fplPct < 100) {
        subsidyNote = `<div style="background:#fff0f0; border-left:3px solid #e74c3c; padding:14px; border-radius:8px; font-size:0.9rem;">⚠️ Your income (${fplPct.toFixed(0)}% FPL) may be below the marketplace subsidy threshold. You may qualify for Medicaid. Contact your state's Medicaid office or HealthCare.gov for guidance.</div>`;
    } else {
        // Max % of income you pay under ACA (2025 enhanced rates)
        let maxIncomePct;
        if (fplPct <= 133) maxIncomePct = 0.00;
        else if (fplPct <= 150) maxIncomePct = 0.00;
        else if (fplPct <= 200) maxIncomePct = 0.02;
        else if (fplPct <= 250) maxIncomePct = 0.04;
        else if (fplPct <= 300) maxIncomePct = 0.06;
        else if (fplPct <= 400) maxIncomePct = 0.085;
        else maxIncomePct = 0.085;

        const maxAnnual = income * maxIncomePct;
        const silverAnnual = silverPremium * 12;
        subsidy = Math.max(0, silverAnnual - maxAnnual) / 12;

        if (subsidy > 0) {
            subsidyNote = `<div style="background:#f0fff4; border-left:3px solid #27ae60; padding:14px; border-radius:8px; font-size:0.9rem;">✅ You likely qualify for a subsidy of approximately <strong>${fmt(subsidy)}/month</strong>. This is applied to your Silver plan benchmark; you can apply it to any metal tier. Your income is <strong>${fplPct.toFixed(0)}% of the Federal Poverty Level</strong>.</div>`;
        } else {
            subsidyNote = `<div style="background:#f8f9fc; border-left:3px solid #95a5a6; padding:14px; border-radius:8px; font-size:0.9rem;">Your income (${fplPct.toFixed(0)}% FPL) may exceed the subsidy threshold for your income level. You may still benefit from marketplace plans for competitive rates.</div>`;
        }
    }

    const netPremium = Math.max(0, selectedPremium - subsidy);

    document.getElementById('net-premium').textContent = fmt(netPremium) + '/mo';
    document.getElementById('full-premium').textContent = fmt(selectedPremium) + '/mo';
    document.getElementById('subsidy').textContent = fmt(subsidy) + '/mo';
    document.getElementById('fpl').textContent = fplPct.toFixed(0) + '%';
    document.getElementById('subsidy-info').innerHTML = subsidyNote;

    if (employer === 'yes') {
        document.getElementById('employer-note').style.display = 'block';
        document.getElementById('employer-note').innerHTML = '⚠️ You indicated you have access to employer coverage. Employer-sponsored insurance is often more cost-effective. Compare your employer\'s plan to marketplace options before deciding.';
    }

    // Plan comparison
    const plans = ['bronze', 'silver', 'gold', 'platinum'];
    const planNames = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
    document.getElementById('plan-comparison').innerHTML = plans.map(p => {
        const pPremium = silverPremium * planMultipliers[p];
        const pNet = Math.max(0, pPremium - subsidy);
        const sel = p === plan;
        return `<div class="plan-row ${sel ? 'selected' : ''}">
            <div>
                <div class="plan-name">${planNames[p]} ${sel ? '← your selection' : ''}</div>
                <div class="plan-details">Deductible: ${planDeductibles[p]} · OOP Max: ${planOOP[p]} · Coinsurance: ${planCoinsurance[p]}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:700; color:#005c97;">${fmt(pNet)}/mo</div>
                <div style="font-size:0.8rem; color:#7f8c8d;">Full: ${fmt(pPremium)}/mo</div>
            </div>
        </div>`;
    }).join('');

    document.getElementById('results').classList.add('show');
}

function resetInsurance() { document.getElementById('results').classList.remove('show'); }
