// Set max date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('birthDate').setAttribute('max', today);
});

function calculateAge() {
    const birthDateInput = document.getElementById('birthDate').value;
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Validate input
    if (!birthDateInput) {
        showError('Please select your date of birth');
        resultsDiv.classList.add('hidden');
        return;
    }

    const birthDate = new Date(birthDateInput);
    const today = new Date();

    // Validate date is not in future
    if (birthDate > today) {
        showError('Birth date cannot be in the future');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Validate reasonable age
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) {
        showError('Please enter a valid birth date');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Calculate age
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    // Calculate total days
    const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Calculate days until next birthday
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

    // Get day of week born
    const days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekBorn = days_of_week[birthDate.getDay()];

    // Format next birthday date
    const nextBirthdayFormatted = nextBirthday.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update DOM
    document.getElementById('years').textContent = years;
    document.getElementById('months').textContent = months;
    document.getElementById('days').textContent = days;
    document.getElementById('totalDays').textContent = totalDays.toLocaleString();
    document.getElementById('totalHours').textContent = totalHours.toLocaleString();
    document.getElementById('totalMinutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('daysUntilBirthday').textContent = daysUntilBirthday;
    document.getElementById('nextBirthdayDate').textContent = nextBirthdayFormatted;
    document.getElementById('dayOfWeek').textContent = dayOfWeekBorn;

    // Show results
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function resetCalculator() {
    document.getElementById('birthDate').value = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('birthDate').focus();
}

// Allow Enter key to calculate
document.getElementById('birthDate').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        calculateAge();
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}
