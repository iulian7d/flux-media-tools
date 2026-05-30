let currentQRCode = null;
let currentText = '';

function generateQRCode() {
    const qrText = document.getElementById('qrText').value.trim();
    const qrSize = parseInt(document.getElementById('qrSize').value);
    const foreground = document.getElementById('foreground').value;
    const background = document.getElementById('background').value;

    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous errors
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Validate input
    if (!qrText) {
        showError('Please enter text or URL to generate a QR code');
        resultsDiv.classList.add('hidden');
        return;
    }

    if (qrText.length > 2953) {
        showError('Text is too long for QR code (max 2953 characters)');
        resultsDiv.classList.add('hidden');
        return;
    }

    // Clear previous QR code
    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = '';
    currentText = qrText;

    try {
        // Generate QR code
        currentQRCode = new QRCode(container, {
            text: qrText,
            width: qrSize,
            height: qrSize,
            colorDark: foreground,
            colorLight: background,
            correctLevel: QRCode.CorrectLevel.H
        });

        // Update stats
        document.getElementById('contentLength').textContent = qrText.length + ' characters';
        document.getElementById('displaySize').textContent = qrSize + 'px';

        // Show results
        resultsDiv.classList.remove('hidden');

        // Scroll to results
        setTimeout(() => {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } catch (error) {
        showError('Error generating QR code. Please try again.');
        resultsDiv.classList.add('hidden');
    }
}

function downloadQRCode() {
    const container = document.getElementById('qrCodeContainer');
    const canvas = container.querySelector('canvas');

    if (!canvas) {
        showError('Please generate a QR code first');
        return;
    }

    // Convert canvas to image
    canvas.toBlob(function(blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Create filename from content (first 20 chars)
        const filename = 'qrcode_' + currentText.substring(0, 20).replace(/[^a-z0-9]/gi, '_') + '.png';
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Downloaded!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

function copyQRLink() {
    const container = document.getElementById('qrCodeContainer');
    const canvas = container.querySelector('canvas');

    if (!canvas) {
        showError('Please generate a QR code first');
        return;
    }

    // Get data URL from canvas
    const dataUrl = canvas.toDataURL('image/png');

    // Copy to clipboard (as data URL)
    navigator.clipboard.writeText(dataUrl).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        // Fallback: copy as simple message
        navigator.clipboard.writeText('QR Code generated: ' + currentText).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            showError('Failed to copy to clipboard');
        });
    });
}

function resetGenerator() {
    document.getElementById('qrText').value = '';
    document.getElementById('qrSize').value = '250';
    document.getElementById('foreground').value = '#000000';
    document.getElementById('background').value = '#FFFFFF';
    document.getElementById('qrCodeContainer').innerHTML = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    currentQRCode = null;
    currentText = '';
    document.getElementById('qrText').focus();
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Allow Enter key to generate (in textarea: Ctrl+Enter)
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('qrText');
    textarea.addEventListener('keypress', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            generateQRCode();
        }
    });
});
