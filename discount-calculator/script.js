function calculateDiscount() {
    const originalPriceInput = document.getElementById('originalPrice').value;
    const discountPercentInput = document.getElementById('discountPercent').value;
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Validate inputs
    if (!originalPriceInput || !discountPercentInput) {
        showError('Please enter both original price and discount percentage');
        resultsDiv.classList.add('hidden');
        return;
    }

    const originalPrice = parseFloat(originalPriceInput);
    const discountPercent = parseFloat(discountPercentInput);

    // Validate values
    if (isNaN(originalPrice) || originalPrice < 0) {
        showError('Please enter a valid original price');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        showError('Please enter a discount percentage between 0 and 100');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (originalPrice === 0) {
        showError('Original price must be greater than 0');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Calculate discount
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;

    // Update DOM with results
    document.getElementById('discountAmount').textContent = discountAmount.toFixed(2);
    document.getElementById('finalPrice').textContent = finalPrice.toFixed(2);

    // Update stats
    document.getElementById('displayOriginal').textContent = '$' + originalPrice.toFixed(2);
    document.getElementById('displayDiscount').textContent = discountPercent.toFixed(2) + '%';
    document.getElementById('displaySavings').textContent = '$' + discountAmount.toFixed(2);
    document.getElementById('displayFinal').textContent = '$' + finalPrice.toFixed(2);

    // Show results
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function setDiscount(percentage) {
    document.getElementById('discountPercent').value = percentage;
    calculateDiscount();
}

function resetCalculator() {
    document.getElementById('originalPrice').value = '';
    document.getElementById('discountPercent').value = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('originalPrice').focus();
}

function copyToClipboard() {
    const originalPrice = document.getElementById('displayOriginal').textContent;
    const discount = document.getElementById('displayDiscount').textContent;
    const savings = document.getElementById('displaySavings').textContent;
    const finalPrice = document.getElementById('displayFinal').textContent;

    const text = `Discount Calculator Results:\nOriginal Price: ${originalPrice}\nDiscount: ${discount}\nYou Save: ${savings}\nFinal Price: ${finalPrice}`;

    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        showError('Failed to copy to clipboard');
    });
}

function shareResult() {
    const originalPrice = document.getElementById('displayOriginal').textContent;
    const discount = document.getElementById('displayDiscount').textContent;
    const finalPrice = document.getElementById('displayFinal').textContent;

    const text = `I found a discount! Original: ${originalPrice}, Discount: ${discount}, Final Price: ${finalPrice}. Calculate your own at https://discount.fluxmediasystems.com`;

    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Discount Calculator',
            text: text,
            url: 'https://discount.fluxmediasystems.com'
        }).catch(() => {
            // Share was cancelled, no error needed
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied to share!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            showError('Unable to share. Please try again.');
        });
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('originalPrice').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('discountPercent').focus();
        }
    });

    document.getElementById('discountPercent').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            calculateDiscount();
        }
    });
});
