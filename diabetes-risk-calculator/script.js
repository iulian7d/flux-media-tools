function calcDiabetes() {
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    const hFt = parseInt(document.getElementById('height-ft').value) || 5;
    const hIn = parseInt(document.getElementById('height-in').value) || 9;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const waist = parseFloat(document.getElementById('waist').value) || 0;
    const activity = document.getElementById('activity').value;
    const family = document.getElementById('family').value;
    const diet = document.getElementById('diet').value;
    const hbp = document.getElementById('hbp').value;
    const gdm = document.getElementById('gdm').value;

    if (!age || !weight) { alert('Please fill in all required fields.'); return; }

    const heightIn = hFt * 12 + hIn;
    const bmi = (weight / (heightIn * heightIn)) * 703;

    let score = 0;
    const factors = [];
    const actions = [];

    // Age
    if (age >= 65) { score += 3; factors.push({ t: `Age ${age} (65+)`, bad: true }); }
    else if (age >= 45) { score += 2; factors.push({ t: `Age ${age} (45–64)`, bad: true }); }
    else if (age >= 40) { score += 1; factors.push({ t: `Age ${age} (40–44) — moderate risk`, bad: true }); }
    else factors.push({ t: `Age ${age} — low age-related risk`, bad: false });

    // BMI
    let bmiLabel = '';
    if (bmi < 18.5) bmiLabel = 'Underweight';
    else if (bmi < 25) bmiLabel = 'Normal weight';
    else if (bmi < 30) bmiLabel = 'Overweight';
    else if (bmi < 35) bmiLabel = 'Obese Class I';
    else bmiLabel = 'Obese Class II+';

    if (bmi >= 35) { score += 3; factors.push({ t: `BMI ${bmi.toFixed(1)} (${bmiLabel})`, bad: true }); actions.push('Losing 5–7% of body weight significantly reduces diabetes risk.'); }
    else if (bmi >= 30) { score += 2; factors.push({ t: `BMI ${bmi.toFixed(1)} (${bmiLabel})`, bad: true }); actions.push('Working toward a healthy BMI (18.5–24.9) reduces your risk.'); }
    else if (bmi >= 25) { score += 1; factors.push({ t: `BMI ${bmi.toFixed(1)} (${bmiLabel})`, bad: true }); }
    else factors.push({ t: `BMI ${bmi.toFixed(1)} (${bmiLabel}) ✓`, bad: false });
    document.getElementById('bmi-val').textContent = bmi.toFixed(1);
    document.getElementById('bmi-label').textContent = `(${bmiLabel})`;

    // Waist
    const waistRisk = sex === 'male' ? 40 : 35;
    if (waist && waist > waistRisk) {
        score += 2;
        factors.push({ t: `Waist ${waist}" — above ${waistRisk}" threshold for ${sex}s`, bad: true });
        actions.push('Reducing waist circumference through diet and exercise lowers abdominal fat, a key diabetes risk factor.');
    } else if (waist) {
        factors.push({ t: `Waist ${waist}" — within healthy range ✓`, bad: false });
    }

    // Activity
    if (activity === 'sedentary') { score += 2; factors.push({ t: 'Sedentary lifestyle', bad: true }); actions.push('Aim for 150 minutes of moderate exercise per week. Even walking 30 min/day reduces risk by up to 30%.'); }
    else if (activity === 'moderate') { score += 1; factors.push({ t: 'Moderate activity level', bad: true }); }
    else factors.push({ t: 'Active lifestyle ✓', bad: false });

    // Family history
    if (family === 'parent') { score += 3; factors.push({ t: 'Parent/sibling with diabetes — strong genetic risk', bad: true }); }
    else if (family === 'extended') { score += 1; factors.push({ t: 'Extended family history of diabetes', bad: true }); }
    else factors.push({ t: 'No family history of diabetes ✓', bad: false });

    // Diet
    if (diet === 'poor') { score += 2; factors.push({ t: 'High sugar/processed food diet', bad: true }); actions.push('Reduce refined carbs and added sugars. Focus on vegetables, lean protein, and whole grains.'); }
    else if (diet === 'mixed') { score += 1; factors.push({ t: 'Mixed diet quality', bad: false }); }
    else factors.push({ t: 'Healthy diet ✓', bad: false });

    // HBP
    if (hbp === 'yes') { score += 2; factors.push({ t: 'History of high blood pressure', bad: true }); actions.push('Managing blood pressure with lifestyle changes and medication reduces your overall metabolic risk.'); }
    else factors.push({ t: 'No high blood pressure ✓', bad: false });

    // GDM
    if (gdm === 'yes') { score += 3; factors.push({ t: 'History of gestational diabetes', bad: true }); actions.push('Women with a history of gestational diabetes should get tested for Type 2 diabetes every 1–3 years.'); }

    // Classify
    let riskLevel, riskColor, riskBg, riskDesc;
    if (score <= 3) {
        riskLevel = 'Low Risk'; riskColor = '#00b09b'; riskBg = '#f0fff9';
        riskDesc = 'Your risk is low. Continue healthy habits and get a screening test at your next check-up.';
    } else if (score <= 7) {
        riskLevel = 'Moderate Risk'; riskColor = '#f4a261'; riskBg = '#fff8f0';
        riskDesc = 'You have some risk factors. Lifestyle changes can significantly reduce your risk. Consider getting a blood glucose test.';
        if (!actions.length) actions.push('Schedule a fasting blood glucose or A1C test with your doctor.');
    } else {
        riskLevel = 'High Risk'; riskColor = '#e63946'; riskBg = '#fff0f0';
        riskDesc = 'Multiple significant risk factors detected. Please see your doctor for a diabetes screening (A1C or fasting glucose test).';
        actions.unshift('See your doctor for a diabetes screening test as soon as possible.');
    }

    if (!actions.includes('Eat more fiber-rich foods.')) actions.push('Aim for 7–9 hours of quality sleep. Poor sleep increases insulin resistance.');
    if (!actions.some(a => a.includes('doctor'))) actions.push('Regular check-ups with annual blood glucose testing are recommended for your age group.');

    const riskBox = document.getElementById('risk-box');
    riskBox.style.background = riskBg;
    riskBox.style.border = `2px solid ${riskColor}30`;
    document.getElementById('risk-score').textContent = score;
    document.getElementById('risk-score').style.color = riskColor;
    document.getElementById('risk-label').textContent = riskLevel;
    document.getElementById('risk-label').style.color = riskColor;
    document.getElementById('risk-desc').textContent = riskDesc;

    document.getElementById('risk-factors').innerHTML = factors.map(f =>
        `<div class="risk-factor ${f.bad?'bad':'good'}"><span class="icon">${f.bad?'🔴':'✅'}</span><span class="text">${f.t}</span></div>`
    ).join('');

    document.getElementById('action-plan').innerHTML = actions.map(a =>
        `<div class="action-item">💡 ${a}</div>`
    ).join('');

    document.getElementById('results').classList.add('show');
}
function resetDiabetes() { document.getElementById('results').classList.remove('show'); }
