const categories = {
    male: [
        { label: 'Essential Fat', min: 2, max: 5, color: '#4cc9f0', bg: '#f0faff' },
        { label: 'Athlete', min: 6, max: 13, color: '#4361ee', bg: '#f0f1ff' },
        { label: 'Fitness', min: 14, max: 17, color: '#27ae60', bg: '#f0fff4' },
        { label: 'Average', min: 18, max: 24, color: '#f4a261', bg: '#fff8f0' },
        { label: 'Obese', min: 25, max: 100, color: '#e63946', bg: '#fff0f0' }
    ],
    female: [
        { label: 'Essential Fat', min: 10, max: 13, color: '#4cc9f0', bg: '#f0faff' },
        { label: 'Athlete', min: 14, max: 20, color: '#4361ee', bg: '#f0f1ff' },
        { label: 'Fitness', min: 21, max: 24, color: '#27ae60', bg: '#f0fff4' },
        { label: 'Average', min: 25, max: 31, color: '#f4a261', bg: '#fff8f0' },
        { label: 'Obese', min: 32, max: 100, color: '#e63946', bg: '#fff0f0' }
    ]
};
const idealBF = { male: '10–20%', female: '18–28%' };

function updateMethod() {
    const method = document.getElementById('method').value;
    const sex = document.getElementById('sex').value;
    document.getElementById('navy-fields').style.display = method === 'navy' ? 'block' : 'none';
    document.getElementById('hip-group').style.display = (method === 'navy' && sex === 'female') ? 'flex' : 'none';
}

function calcBodyFat() {
    const method = document.getElementById('method').value;
    const sex = document.getElementById('sex').value;
    const age = parseInt(document.getElementById('age').value) || 30;
    const hFt = parseInt(document.getElementById('h-ft').value) || 5;
    const hIn = parseInt(document.getElementById('h-in').value) || 10;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    if (!weight) { alert('Please enter your weight.'); return; }

    const heightIn = hFt * 12 + hIn;
    const heightCm = heightIn * 2.54;
    const weightKg = weight * 0.453592;
    const bmi = (weight / (heightIn * heightIn)) * 703;

    let bf;
    if (method === 'navy') {
        const waist = parseFloat(document.getElementById('waist').value) || 0;
        const neck = parseFloat(document.getElementById('neck').value) || 0;
        if (!waist || !neck) { alert('Please enter waist and neck measurements for the Navy formula.'); return; }
        const waistCm = waist * 2.54;
        const neckCm = neck * 2.54;
        if (sex === 'male') {
            bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
        } else {
            const hips = parseFloat(document.getElementById('hips').value) || 0;
            if (!hips) { alert('Please enter hip measurement for women.'); return; }
            const hipsCm = hips * 2.54;
            bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
        }
    } else {
        // Deurenberg formula
        bf = (1.20 * bmi) + (0.23 * age) - (10.8 * (sex === 'male' ? 1 : 0)) - 5.4;
    }

    bf = Math.round(bf * 10) / 10;
    const fatMass = (bf / 100) * weight;
    const leanMass = weight - fatMass;

    // Find category
    const cats = categories[sex];
    let cat = cats[cats.length - 1];
    for (const c of cats) {
        if (bf >= c.min && bf <= c.max) { cat = c; break; }
    }

    document.getElementById('bf-pct').textContent = bf + '%';
    document.getElementById('bf-pct').style.color = cat.color;
    document.getElementById('bf-category').textContent = cat.label;
    document.getElementById('bf-category').style.color = cat.color;
    const rfBox = document.getElementById('bf-result');
    rfBox.style.background = cat.bg;
    rfBox.style.border = `2px solid ${cat.color}30`;

    document.getElementById('fat-mass').textContent = fatMass.toFixed(1) + ' lbs';
    document.getElementById('lean-mass').textContent = leanMass.toFixed(1) + ' lbs';
    document.getElementById('ideal-bf').textContent = idealBF[sex];

    // Bar marker position
    const maxBF = sex === 'male' ? 35 : 45;
    const pct = Math.min(100, Math.max(0, (bf / maxBF) * 100));
    document.getElementById('bf-bar-marker').style.left = pct + '%';

    // Categories table
    document.getElementById('categories-table').innerHTML = cats.map(c => {
        const active = cat.label === c.label;
        return `<div class="cat-row ${active ? 'cat-active' : ''}" style="background:${active ? c.bg : 'transparent'}; color:${active ? c.color : '#555'};">
            <span>${c.label}</span>
            <span style="font-size:0.85rem;">${c.min}% – ${c.max === 100 ? c.min + '+' : c.max + '%'}</span>
            ${active ? '<span>← You are here</span>' : ''}
        </div>`;
    }).join('');

    document.getElementById('results').classList.add('show');
}
function resetBF() { document.getElementById('results').classList.remove('show'); }
