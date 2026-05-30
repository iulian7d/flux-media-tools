const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

let passwordIsHidden = false;

// Update length display when slider changes
document.addEventListener('DOMContentLoaded', function() {
    const lengthSlider = document.getElementById('passwordLength');
    lengthSlider.addEventListener('input', function() {
        document.getElementById('lengthDisplay').textContent = this.value;
    });
});

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;

    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Validate at least one character type is selected
    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        showError('Please select at least one character type');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Build character set
    let characterSet = '';
    if (useUppercase) characterSet += UPPERCASE;
    if (useLowercase) characterSet += LOWERCASE;
    if (useNumbers) characterSet += NUMBERS;
    if (useSymbols) characterSet += SYMBOLS;

    // Generate password
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characterSet.length);
        password += characterSet[randomIndex];
    }

    // Display password (hidden by default)
    const passwordInput = document.getElementById('generatedPassword');
    passwordInput.value = password;
    passwordInput.type = 'password';
    passwordIsHidden = true;

    // Update display
    document.getElementById('displayLength').textContent = length;

    // Count character types
    let typeCount = 0;
    if (useUppercase) typeCount++;
    if (useLowercase) typeCount++;
    if (useNumbers) typeCount++;
    if (useSymbols) typeCount++;
    document.getElementById('displayTypes').textContent = typeCount;

    // Calculate possible combinations
    const possibleCombinations = Math.pow(characterSet.length, length);
    const combinationsText = possibleCombinations > 1e15
        ? '1e+' + Math.floor(Math.log10(possibleCombinations)).toString().slice(0, 2)
        : formatNumber(possibleCombinations);
    document.getElementById('displayCombinations').textContent = combinationsText;

    // Update strength indicator
    updateStrength(length, typeCount);

    // Show results
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function updateStrength(length, typeCount) {
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthText = document.getElementById('strengthText');

    let strength = 'Weak';
    let percentage = 33;
    let color = '#ef4444';

    if (length >= 16 && typeCount === 4) {
        strength = 'Very Strong';
        percentage = 100;
        color = '#10b981';
    } else if (length >= 12 && typeCount >= 3) {
        strength = 'Strong';
        percentage = 75;
        color = '#4ade80';
    } else if (length >= 10 && typeCount >= 2) {
        strength = 'Medium';
        percentage = 50;
        color = '#f59e0b';
    } else {
        strength = 'Weak';
        percentage = 33;
        color = '#ef4444';
    }

    strengthIndicator.style.width = percentage + '%';
    strengthIndicator.style.background = color;
    strengthText.textContent = strength;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('generatedPassword');
    if (passwordIsHidden) {
        passwordInput.type = 'text';
        passwordIsHidden = false;
    } else {
        passwordInput.type = 'password';
        passwordIsHidden = true;
    }
}

function copyPassword() {
    const password = document.getElementById('generatedPassword').value;

    if (!password) {
        showError('Please generate a password first');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        showError('Failed to copy password');
    });
}

function resetGenerator() {
    document.getElementById('uppercase').checked = true;
    document.getElementById('lowercase').checked = true;
    document.getElementById('numbers').checked = true;
    document.getElementById('symbols').checked = true;
    document.getElementById('passwordLength').value = 16;
    document.getElementById('lengthDisplay').textContent = '16';
    document.getElementById('generatedPassword').value = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function formatNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(1) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}
