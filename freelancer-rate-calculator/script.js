function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcRate() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const taxRate = parseFloat(document.getElementById('tax').value) || 25;
    const weeks = parseFloat(document.getElementById('weeks').value) || 48;
    const billable = parseFloat(document.getElementById('billable').value) || 30;
    const software = parseFloat(document.getElementById('software').value) || 0;
    const health = parseFloat(document.getElementById('health').value) || 0;
    const equipment = parseFloat(document.getElementById('equipment').value) || 0;
    const other = parseFloat(document.getElementById('other').value) || 0;

    if (income <= 0) { alert('Please enter your desired income.'); return; }

    const totalExpenses = software + health + equipment + other;
    const grossNeeded = income / (1 - taxRate / 100) + totalExpenses;
    const totalHours = weeks * billable;
    const hourlyRate = grossNeeded / totalHours;
    const taxAmt = grossNeeded - totalExpenses - income;

    document.getElementById('hourly-rate').textContent = '$' + Math.ceil(hourlyRate) + '/hr';
    document.getElementById('day-rate').textContent = fmt(hourlyRate * 8);
    document.getElementById('project-week').textContent = fmt(hourlyRate * billable);
    document.getElementById('gross-needed').textContent = fmt(grossNeeded);

    document.getElementById('b-income').textContent = fmt(income);
    document.getElementById('b-tax').textContent = fmt(taxAmt);
    document.getElementById('b-expenses').textContent = fmt(totalExpenses);
    document.getElementById('b-gross').textContent = fmt(grossNeeded);
    document.getElementById('b-hours').textContent = Math.round(totalHours).toLocaleString() + ' hrs';
    document.getElementById('suggested-rate').textContent = '$' + Math.ceil(hourlyRate * 1.2) + '/hr';

    document.getElementById('results').classList.add('show');
}

function resetRate() { document.getElementById('results').classList.remove('show'); }
