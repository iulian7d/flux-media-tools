function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', ['wake','sleep','debt'][i] === tab);
    });
    ['wake','sleep','debt'].forEach(t => {
        document.getElementById('tab-'+t).classList.toggle('active', t === tab);
    });
}

function fmtTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function addMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(2000, 0, 1, h, m);
    d.setMinutes(d.getMinutes() + mins);
    return d;
}

function renderSleepTimes(containerId, times) {
    const el = document.getElementById(containerId);
    el.innerHTML = times.map((t, i) => {
        const isBest = t.cycles === 5 || t.cycles === 6;
        return `<div class="sleep-time-row ${isBest ? 'best' : ''}">
            <div>
                <div class="sleep-time-val">${t.time}</div>
                <div class="sleep-time-cycles">${t.cycles} sleep cycles · ${t.hours} hours of sleep</div>
            </div>
            <div style="text-align:right;">
                ${isBest ? '<span class="sleep-badge">Recommended</span>' : ''}
                <div class="sleep-time-hrs" style="margin-top:4px;">😴 ${t.quality}</div>
            </div>
        </div>`;
    }).join('');
}

function calcWake() {
    const wakeTime = document.getElementById('wake-time').value;
    const fallAsleep = parseInt(document.getElementById('fall-asleep-wake').value) || 14;
    const times = [];
    for (let cycles = 6; cycles >= 2; cycles--) {
        const totalMins = cycles * 90 + fallAsleep;
        const sleepDate = addMinutes(wakeTime, -totalMins);
        const hrs = (cycles * 90 / 60).toFixed(1);
        const quality = cycles >= 6 ? 'Excellent' : cycles >= 5 ? 'Great' : cycles >= 4 ? 'Good' : cycles === 3 ? 'Fair' : 'Poor';
        times.push({ time: fmtTime(sleepDate), cycles, hours: hrs + ' hrs', quality });
    }
    document.getElementById('wake-times').innerHTML = '';
    renderSleepTimes('wake-times', times);
    document.getElementById('wake-results').classList.add('show');
}

function calcSleep() {
    const sleepTime = document.getElementById('sleep-time').value;
    const fallAsleep = parseInt(document.getElementById('fall-asleep-sleep').value) || 14;
    const times = [];
    for (let cycles = 3; cycles <= 7; cycles++) {
        const totalMins = cycles * 90 + fallAsleep;
        const wakeDate = addMinutes(sleepTime, totalMins);
        const hrs = (cycles * 90 / 60).toFixed(1);
        const quality = cycles >= 6 ? 'Excellent' : cycles >= 5 ? 'Great' : cycles >= 4 ? 'Good' : cycles === 3 ? 'Fair' : 'Poor';
        times.push({ time: fmtTime(wakeDate), cycles, hours: hrs + ' hrs', quality });
    }
    renderSleepTimes('sleep-times', times);
    document.getElementById('sleep-results').classList.add('show');
}

const sleepNeeds = [
    { age: 'Newborns (0–3 months)', need: '14–17 hours' },
    { age: 'Infants (4–11 months)', need: '12–15 hours' },
    { age: 'Toddlers (1–2 years)', need: '11–14 hours' },
    { age: 'Preschool (3–5 years)', need: '10–13 hours' },
    { age: 'School age (6–13)', need: '9–11 hours' },
    { age: 'Teenagers (14–17)', need: '8–10 hours' },
    { age: 'Young adults (18–25)', need: '7–9 hours' },
    { age: 'Adults (26–64)', need: '7–9 hours' },
    { age: 'Older adults (65+)', need: '7–8 hours' }
];

document.getElementById('sleep-needs-table').innerHTML = sleepNeeds.map(r =>
    `<div class="needs-row"><span>${r.age}</span><strong>${r.need}</strong></div>`
).join('');

function calcDebt() {
    const age = parseInt(document.getElementById('debt-age').value) || 30;
    const avg = parseFloat(document.getElementById('avg-sleep').value) || 0;
    const days = parseInt(document.getElementById('debt-days').value) || 7;
    if (!avg) { alert('Please enter your average sleep.'); return; }

    let recommended;
    if (age < 6) recommended = 11;
    else if (age < 14) recommended = 10;
    else if (age < 18) recommended = 9;
    else if (age < 65) recommended = 8;
    else recommended = 7.5;

    const debtPerNight = Math.max(0, recommended - avg);
    const weeklyDebt = debtPerNight * days;
    const isInDebt = weeklyDebt > 0;

    document.getElementById('debt-val').textContent = weeklyDebt.toFixed(1) + ' hrs/week';
    document.getElementById('debt-label').textContent = isInDebt ? 'Sleep Debt This Week' : 'No Sleep Debt!';

    let advice = '';
    if (!isInDebt) {
        advice = `<div style="background:#f0fff4; border-radius:10px; padding:16px; color:#27ae60; font-weight:600;">✅ You're getting enough sleep! You need about ${recommended} hours/night for your age, and you're getting ${avg} hours.</div>`;
    } else if (weeklyDebt < 5) {
        advice = `<div style="background:#fff8f0; border-radius:10px; padding:16px;">⚠️ You have a moderate sleep deficit of <strong>${weeklyDebt.toFixed(1)} hours</strong> per week. Try going to bed 30 minutes earlier each night to gradually pay it back. Avoid sleeping in more than 1 hour on weekends to protect your sleep schedule.</div>`;
    } else {
        advice = `<div style="background:#fff0f0; border-radius:10px; padding:16px;">🚨 Significant sleep debt of <strong>${weeklyDebt.toFixed(1)} hours/week</strong>. Chronic sleep deprivation impairs cognition, metabolism, and immune function. Prioritize adding 30–60 minutes of sleep per night. You need about <strong>${recommended} hours/night</strong> but are only getting ${avg}.</div>`;
    }
    document.getElementById('debt-advice').innerHTML = advice;
    document.getElementById('debt-results').classList.add('show');
}
