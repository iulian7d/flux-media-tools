const babySizes = {
    4: '🫐 Poppy seed (0.04 in)', 5: '🌱 Sesame seed (0.13 in)', 6: '🫛 Pea (0.25 in)',
    7: '🫐 Blueberry (0.51 in)', 8: '🫑 Kidney bean (0.63 in)', 9: '🍇 Grape (0.9 in)',
    10: '🫐 Kumquat (1.2 in)', 11: '🍋 Fig (1.6 in)', 12: '🍋 Lime (2.1 in)',
    13: '🫛 Pea pod (2.9 in)', 14: '🍋 Lemon (3.4 in)', 15: '🍊 Navel orange (4.0 in)',
    16: '🥑 Avocado (4.6 in)', 17: '🍐 Pear (5.1 in)', 18: '🫑 Bell pepper (5.6 in)',
    19: '🥭 Mango (6.0 in)', 20: '🍌 Banana (6.5 in)', 21: '🥕 Carrot (10.5 in)',
    22: '🌽 Corn (10.9 in)', 23: '🥭 Large mango (11.4 in)', 24: '🌽 Ear of corn (11.8 in)',
    25: '🥦 Rutabaga (13.6 in)', 26: '🥬 Scallion (14.0 in)', 27: '🥦 Head of cauliflower (14.4 in)',
    28: '🍆 Eggplant (14.8 in)', 29: '🎃 Butternut squash (15.2 in)', 30: '🥦 Large cabbage (15.7 in)',
    31: '🥥 Coconut (16.2 in)', 32: '🌿 Squash (16.7 in)', 33: '🍍 Pineapple (17.2 in)',
    34: '🎃 Cantaloupe (17.7 in)', 35: '🍈 Honeydew melon (18.2 in)', 36: '🥬 Romaine lettuce (18.7 in)',
    37: '🫁 Swiss chard (19.1 in)', 38: '🥬 Leek (19.6 in)', 39: '🍉 Mini watermelon (20.0 in)',
    40: '🎃 Small pumpkin (20.4 in)'
};

const milestones = [
    { week: 6, text: 'Heartbeat detectable by ultrasound' },
    { week: 10, text: 'All vital organs have formed' },
    { week: 12, text: 'End of first trimester — miscarriage risk drops significantly' },
    { week: 13, text: 'Baby can suck their thumb' },
    { week: 16, text: 'Gender may be visible on ultrasound' },
    { week: 18, text: 'Anatomy scan (Level 2 ultrasound) recommended' },
    { week: 20, text: 'Halfway point! Baby starts hearing sounds' },
    { week: 24, text: 'Viability threshold — baby can survive outside womb with support' },
    { week: 27, text: 'End of second trimester' },
    { week: 28, text: 'Third trimester begins. Glucose screening test.' },
    { week: 32, text: 'Baby practices breathing movements' },
    { week: 36, text: 'Baby considered late preterm (most organs ready)' },
    { week: 37, text: 'Full term! Baby is ready to be born' },
    { week: 40, text: '🎉 Due date!' }
];

function updateMethod() {
    const method = document.getElementById('method').value;
    const cycleGroup = document.getElementById('cycle-group');
    const weeksGroup = document.getElementById('weeks-group');
    const dateLabel = document.getElementById('date-label');
    cycleGroup.style.display = method === 'lmp' ? 'flex' : 'none';
    weeksGroup.style.display = method === 'ultrasound' ? 'flex' : 'none';
    const labels = { lmp: 'Date of Last Period', conception: 'Conception Date', ivf: 'IVF Transfer Date', ultrasound: 'Ultrasound Date' };
    dateLabel.textContent = labels[method];
}

function calcPregnancy() {
    const method = document.getElementById('method').value;
    const dateVal = document.getElementById('main-date').value;
    if (!dateVal) { alert('Please enter a date.'); return; }

    const inputDate = new Date(dateVal + 'T00:00:00');
    let lmpDate;
    const cycle = parseInt(document.getElementById('cycle').value) || 28;
    const adjustment = cycle - 28;

    if (method === 'lmp') {
        lmpDate = new Date(inputDate);
    } else if (method === 'conception') {
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14 + adjustment);
        lmpDate.setDate(lmpDate.getDate() - adjustment);
    } else if (method === 'ivf') {
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
    } else {
        const usWeeks = parseInt(document.getElementById('us-weeks').value) || 12;
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - usWeeks * 7);
    }

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280 + adjustment);

    const today = new Date();
    today.setHours(0,0,0,0);
    const daysPreg = Math.floor((today - lmpDate) / (1000*60*60*24));
    const weeksPreg = Math.floor(daysPreg / 7);
    const daysIntoWeek = daysPreg % 7;
    const daysLeft = Math.floor((dueDate - today) / (1000*60*60*24));
    const trimester = weeksPreg < 13 ? '1st' : weeksPreg < 27 ? '2nd' : '3rd';

    document.getElementById('due-date').textContent = dueDate.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    document.getElementById('week-preg').textContent = weeksPreg >= 0 ? `${weeksPreg}w ${daysIntoWeek}d` : 'Not yet';
    document.getElementById('trimester').textContent = weeksPreg >= 0 ? trimester : '—';
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : (daysLeft === 0 ? 'Today!' : `${Math.abs(daysLeft)} days ago`);

    // Timeline
    const pct = Math.min(100, Math.max(0, (weeksPreg / 40) * 100));
    document.getElementById('timeline').innerHTML = `
        <div class="timeline-bar"><div class="timeline-fill" style="width:${pct}%"></div></div>
        <div class="timeline-label"><span>Week 1</span><span>Week 13 (T2)</span><span>Week 27 (T3)</span><span>Week 40</span></div>
    `;

    // Baby size
    const clampedWeek = Math.min(40, Math.max(4, weeksPreg));
    document.getElementById('baby-size').textContent = babySizes[clampedWeek] || 'Data not available for this week';

    // Milestones
    document.getElementById('milestones').innerHTML = milestones.map(m => {
        const done = weeksPreg >= m.week;
        const cls = done ? 'milestone-done' : 'milestone-upcoming';
        const icon = done ? '✅' : '⏳';
        return `<div class="milestone-row"><span class="milestone-week">Week ${m.week}</span><span class="milestone-text ${cls}">${icon} ${m.text}</span></div>`;
    }).join('');

    document.getElementById('results').classList.add('show');
}

function resetPregnancy() { document.getElementById('results').classList.remove('show'); }
