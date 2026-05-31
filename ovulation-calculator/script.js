function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtShort(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function calcOvulation() {
    const lpDateVal = document.getElementById('last-period').value;
    if (!lpDateVal) { alert('Please enter the first day of your last period.'); return; }
    const cycleLen = parseInt(document.getElementById('cycle-len').value) || 28;
    const periodLen = parseInt(document.getElementById('period-len').value) || 5;
    const luteal = parseInt(document.getElementById('luteal').value) || 14;

    const lp = new Date(lpDateVal + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);

    const ovulation = addDays(lp, cycleLen - luteal);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const nextPeriod = addDays(lp, cycleLen);
    const pmsStart = addDays(nextPeriod, -5);
    const periodEnd = addDays(lp, periodLen - 1);

    document.getElementById('ovulation-date').textContent = fmtDate(ovulation);
    document.getElementById('fertile-window').textContent = `${fmtShort(fertileStart)} – ${fmtShort(fertileEnd)}`;
    document.getElementById('next-period').textContent = fmtDate(nextPeriod);
    document.getElementById('pms-start').textContent = fmtDate(pmsStart);

    // Late checker
    const daysLate = Math.floor((today - nextPeriod) / (1000*60*60*24));
    const lateEl = document.getElementById('late-status');
    if (daysLate > 0) {
        lateEl.innerHTML = `<span style="color:#e74c3c; font-weight:600;">You are ${daysLate} day${daysLate>1?'s':''} late. 🤔</span>`;
    } else if (daysLate === 0) {
        lateEl.innerHTML = `<span style="color:#e67e22; font-weight:600;">Your period is due today.</span>`;
    } else {
        lateEl.innerHTML = `<span style="color:#27ae60;">Your next period is in ${Math.abs(daysLate)} days. Not late yet.</span>`;
    }

    // Build 3-month calendar
    // Create sets of special dates for 3 cycles
    const specialDates = new Map();
    for (let c = -1; c <= 2; c++) {
        const cLp = addDays(lp, c * cycleLen);
        const cOv = addDays(cLp, cycleLen - luteal);
        const cFertStart = addDays(cOv, -5);
        const cNextPeriod = addDays(cLp, cycleLen);
        const cPmsStart = addDays(cNextPeriod, -5);
        // Mark period days
        for (let d = 0; d < periodLen; d++) {
            const day = addDays(cLp, d);
            specialDates.set(day.toDateString(), 'period');
        }
        // Mark fertile
        for (let d = -5; d <= 1; d++) {
            const day = addDays(cOv, d);
            if (!specialDates.has(day.toDateString()) || specialDates.get(day.toDateString()) !== 'period') {
                specialDates.set(day.toDateString(), d === 0 ? 'ovulation' : 'fertile');
            }
        }
        // Mark PMS (5 days before next period)
        for (let d = -5; d < 0; d++) {
            const day = addDays(cNextPeriod, d);
            if (!specialDates.has(day.toDateString())) {
                specialDates.set(day.toDateString(), 'pms');
            }
        }
    }

    // Render 3 months
    const startMonth = new Date(lp.getFullYear(), lp.getMonth(), 1);
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = '';
    for (let m = 0; m < 3; m++) {
        const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + m, 1);
        const monthName = month.toLocaleDateString('en-US', {month:'long', year:'numeric'});
        const firstDay = month.getDay();
        const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
        html += `<div class="cal-month">${monthName}</div>`;
        html += `<div class="cal-header">${dayNames.map(d=>`<div class="cal-day-name">${d}</div>`).join('')}</div>`;
        html += `<div class="calendar-grid">`;
        for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const dayDate = new Date(month.getFullYear(), month.getMonth(), d);
            const type = specialDates.get(dayDate.toDateString()) || '';
            const isToday = sameDay(dayDate, today) ? ' today' : '';
            html += `<div class="cal-day ${type}${isToday}">${d}</div>`;
        }
        html += `</div>`;
    }
    document.getElementById('calendar').innerHTML = html;
    document.getElementById('results').classList.add('show');
}

function resetOvulation() { document.getElementById('results').classList.remove('show'); }
