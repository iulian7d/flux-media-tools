let logChart = null;

function classifyBP(sys, dia) {
    if (sys < 90 || dia < 60) return { label: 'Low (Hypotension)', color: '#a8dadc', bg: '#f0feff', advice: 'Low blood pressure may cause dizziness or fainting. If you have symptoms, consult a doctor. Stay hydrated and avoid standing up too quickly.', icon: '💙' };
    if (sys < 120 && dia < 80) return { label: 'Normal', color: '#00b09b', bg: '#f0fff9', advice: 'Your blood pressure is in the healthy range. Keep up the great work with exercise, a balanced diet, and regular check-ups.', icon: '✅' };
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#f7c59f', bg: '#fffbf0', advice: 'Slightly elevated. Lifestyle changes can bring this back to normal: reduce sodium, increase exercise, limit alcohol, and manage stress.', icon: '⚠️' };
    if (sys < 140 || dia < 90) return { label: 'High Blood Pressure Stage 1', color: '#f4a261', bg: '#fff8f0', advice: 'Stage 1 hypertension. Your doctor may recommend lifestyle changes or medication. Monitor regularly and see a healthcare provider.', icon: '🔴' };
    if (sys >= 180 || dia >= 120) return { label: '🚨 Hypertensive Crisis', color: '#e63946', bg: '#fff0f0', advice: 'SEEK MEDICAL ATTENTION IMMEDIATELY. This is a hypertensive crisis. Call emergency services or go to the nearest ER if you experience chest pain, shortness of breath, or visual changes.', icon: '🚨' };
    return { label: 'High Blood Pressure Stage 2', color: '#e76f51', bg: '#fff5f0', advice: 'Stage 2 hypertension requires medical evaluation. Please see a doctor. Treatment typically involves both lifestyle changes and medication.', icon: '🔴' };
}

function checkBP() {
    const sys = parseInt(document.getElementById('systolic').value);
    const dia = parseInt(document.getElementById('diastolic').value);
    const pulse = document.getElementById('pulse').value;
    const notes = document.getElementById('notes').value;

    if (!sys || !dia) { alert('Please enter both systolic and diastolic values.'); return; }

    const cls = classifyBP(sys, dia);
    const box = document.getElementById('bp-result-box');
    box.style.background = cls.bg;
    box.style.border = `2px solid ${cls.color}30`;
    box.style.borderRadius = '12px';
    box.style.padding = '24px';

    document.getElementById('bp-numbers').textContent = `${sys}/${dia}`;
    document.getElementById('bp-numbers').style.color = cls.color;
    document.getElementById('bp-category').textContent = cls.label;
    document.getElementById('bp-category').style.color = cls.color;
    document.getElementById('bp-desc').textContent = pulse ? `Pulse: ${pulse} BPM` : '';
    document.getElementById('bp-advice').innerHTML = `<div style="background:${cls.bg}; border-left:4px solid ${cls.color}; padding:14px; border-radius:8px;">${cls.icon} <strong>${cls.label}:</strong> ${cls.advice}</div>`;

    document.getElementById('result-card').classList.add('show');

    // Save to localStorage
    const readings = JSON.parse(localStorage.getItem('bp_readings') || '[]');
    readings.push({ sys, dia, pulse: pulse || '', notes, date: new Date().toISOString(), category: cls.label });
    localStorage.setItem('bp_readings', JSON.stringify(readings));
    renderLog();
}

function renderLog() {
    const readings = JSON.parse(localStorage.getItem('bp_readings') || '[]');
    if (readings.length === 0) {
        document.getElementById('log-empty').style.display = 'block';
        document.getElementById('log-chart-wrap').style.display = 'none';
        document.getElementById('log-table-wrap').style.display = 'none';
        document.getElementById('log-avg').style.display = 'none';
        document.getElementById('clear-btn').style.display = 'none';
        return;
    }
    document.getElementById('log-empty').style.display = 'none';
    document.getElementById('log-chart-wrap').style.display = 'block';
    document.getElementById('log-table-wrap').style.display = 'block';
    document.getElementById('log-avg').style.display = 'block';
    document.getElementById('clear-btn').style.display = 'inline-block';

    const tbody = document.getElementById('log-tbody');
    tbody.innerHTML = readings.slice().reverse().map((r, i) => {
        const cls = classifyBP(r.sys, r.dia);
        const d = new Date(r.date);
        const dateStr = d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
        return `<tr>
            <td>${dateStr}</td>
            <td style="font-weight:700; color:${cls.color};">${r.sys}/${r.dia}</td>
            <td>${r.pulse || '—'}</td>
            <td style="color:${cls.color};">${r.category}</td>
            <td>${r.notes || '—'}</td>
            <td><button onclick="deleteReading(${readings.length-1-i})" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:1rem;">✕</button></td>
        </tr>`;
    }).join('');

    // Average
    const avgSys = Math.round(readings.reduce((a,r)=>a+r.sys,0)/readings.length);
    const avgDia = Math.round(readings.reduce((a,r)=>a+r.dia,0)/readings.length);
    const avgCls = classifyBP(avgSys, avgDia);
    document.getElementById('log-avg').innerHTML = `<strong>Average over ${readings.length} readings:</strong> <span style="color:${avgCls.color}; font-weight:700;">${avgSys}/${avgDia} — ${avgCls.label}</span>`;

    // Chart
    if (logChart) logChart.destroy();
    const last20 = readings.slice(-20);
    const ctx = document.getElementById('logChart').getContext('2d');
    logChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last20.map(r => new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})),
            datasets: [
                { label: 'Systolic', data: last20.map(r=>r.sys), borderColor: '#e63946', backgroundColor: 'rgba(230,57,70,0.1)', fill: true, tension: 0.4 },
                { label: 'Diastolic', data: last20.map(r=>r.dia), borderColor: '#c77dff', backgroundColor: 'rgba(199,125,255,0.1)', fill: true, tension: 0.4 }
            ]
        },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'bottom'} }, scales:{ y:{ suggestedMin:50, suggestedMax:180 } } }
    });
}

function deleteReading(idx) {
    const readings = JSON.parse(localStorage.getItem('bp_readings') || '[]');
    readings.splice(idx, 1);
    localStorage.setItem('bp_readings', JSON.stringify(readings));
    renderLog();
}

function clearLog() {
    if (confirm('Clear all blood pressure readings?')) {
        localStorage.removeItem('bp_readings');
        renderLog();
    }
}

// Load on page load
renderLog();
