function calculateCalories() {
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const heightFeet = parseInt(document.getElementById('heightFeet').value);
    const heightInches = parseInt(document.getElementById('heightInches').value) || 0;
    const weight = parseFloat(document.getElementById('weight').value);
    const activityLevel = parseFloat(document.getElementById('activity').value);

    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Validate inputs
    if (!age || !heightFeet || !weight) {
        showError('Please fill in all required fields');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (age < 1 || age > 120) {
        showError('Please enter a valid age (1-120)');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (heightFeet < 1 || heightFeet > 8) {
        showError('Please enter a valid height');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (weight < 50 || weight > 500) {
        showError('Please enter a valid weight (50-500 lbs)');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Convert height to cm
    const totalInches = heightFeet * 12 + heightInches;
    const heightCm = totalInches * 2.54;

    // Convert weight to kg
    const weightKg = weight / 2.20462;

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    // Calculate TDEE
    const tdee = Math.round(bmr * activityLevel);

    // Calculate calorie goals
    const loseWeight = tdee - 500;
    const maintain = tdee;
    const gainMuscle = tdee + 500;

    // Calculate macros (for maintain goal)
    const proteinCalories = maintain * 0.30;
    const carbsCalories = maintain * 0.40;
    const fatsCalories = maintain * 0.30;

    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatsGrams = Math.round(fatsCalories / 9);

    // Update DOM
    document.getElementById('tdeeResult').textContent = tdee;
    document.getElementById('bmrtResult').textContent = Math.round(bmr) + ' kcal';
    document.getElementById('activityMultiplier').textContent = activityLevel.toFixed(2);

    document.getElementById('loseWeight').textContent = loseWeight;
    document.getElementById('maintain').textContent = maintain;
    document.getElementById('gainMuscle').textContent = gainMuscle;

    document.getElementById('proteinGrams').textContent = proteinGrams;
    document.getElementById('carbsGrams').textContent = carbsGrams;
    document.getElementById('fatsGrams').textContent = fatsGrams;

    // Show results
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function resetCalculator() {
    document.getElementById('age').value = '';
    document.getElementById('gender').value = 'male';
    document.getElementById('heightFeet').value = '';
    document.getElementById('heightInches').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('activity').value = '1.2';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('age').focus();
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    const inputs = ['age', 'heightFeet', 'heightInches', 'weight'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                calculateCalories();
            }
        });
    });
});
