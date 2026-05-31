function addDrugInput() {
    const container = document.getElementById('drug-inputs');
    const count = container.querySelectorAll('.drug-input-row').length;
    if (count >= 8) { alert('Maximum 8 drugs at once.'); return; }
    const row = document.createElement('div');
    row.className = 'drug-input-row';
    row.innerHTML = `<input type="text" placeholder="Drug or supplement #${count+1}" class="drug-input"><button class="remove-btn" onclick="removeInput(this)">✕</button>`;
    container.appendChild(row);
    updateRemoveButtons();
}

function removeInput(btn) {
    btn.parentElement.remove();
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const rows = document.querySelectorAll('.drug-input-row');
    rows.forEach((row, i) => {
        const btn = row.querySelector('.remove-btn');
        btn.style.display = rows.length > 2 ? 'block' : 'none';
    });
}

async function fetchDrugLabel(drugName) {
    const query = encodeURIComponent(drugName.toLowerCase().trim());
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${query}"+openfda.brand_name:"${query}"&limit=1`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results && data.results.length > 0) return data.results[0];
        // Fallback: broader search
        const url2 = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;
        const res2 = await fetch(url2);
        if (!res2.ok) return null;
        const data2 = await res2.json();
        return data2.results ? data2.results[0] : null;
    } catch (e) {
        return null;
    }
}

function extractInteractionText(label) {
    const sections = ['drug_interactions', 'warnings', 'precautions', 'contraindications'];
    for (const s of sections) {
        if (label[s] && label[s][0]) return label[s][0].substring(0, 1000);
    }
    return null;
}

function checkTextForDrug(text, drugName) {
    if (!text) return false;
    const terms = drugName.toLowerCase().split(' ');
    const t = text.toLowerCase();
    return terms.some(term => term.length > 3 && t.includes(term));
}

function guessSeverity(text, drug) {
    if (!text) return 'unknown';
    const t = text.toLowerCase();
    const drugT = drug.toLowerCase();
    const majorTerms = ['contraindicated', 'avoid', 'serious', 'fatal', 'life-threatening', 'do not use'];
    const moderateTerms = ['caution', 'monitor', 'reduce dose', 'adjust', 'increase risk'];
    if (majorTerms.some(term => t.includes(term) && checkTextForDrug(text, drug))) return 'major';
    if (moderateTerms.some(term => t.includes(term))) return 'moderate';
    return 'minor';
}

function extractRelevantSnippet(text, drug) {
    if (!text) return '';
    const drugLower = drug.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const relevant = sentences.filter(s => s.toLowerCase().includes(drugLower.split(' ')[0]));
    if (relevant.length > 0) return relevant.slice(0, 2).join('. ') + '.';
    return text.substring(0, 300) + (text.length > 300 ? '...' : '');
}

async function checkInteractions() {
    const inputs = Array.from(document.querySelectorAll('.drug-input'))
        .map(i => i.value.trim()).filter(v => v.length > 0);

    if (inputs.length < 2) {
        alert('Please enter at least 2 medications or supplements.');
        return;
    }

    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    // Fetch labels for all drugs
    const labels = {};
    for (const drug of inputs) {
        labels[drug] = await fetchDrugLabel(drug);
    }

    document.getElementById('loading').style.display = 'none';

    const resultsEl = document.getElementById('results');
    let html = '<div style="margin-bottom:16px; font-size:0.9rem; color:#7f8c8d;">Checking: ' +
        inputs.map(d => `<span class="drug-tag">${d}</span>`).join(' ') + '</div>';

    let foundAny = false;
    const pairs = [];
    for (let i = 0; i < inputs.length; i++) {
        for (let j = i+1; j < inputs.length; j++) {
            pairs.push([inputs[i], inputs[j]]);
        }
    }

    for (const [drugA, drugB] of pairs) {
        const labelA = labels[drugA];
        const labelB = labels[drugB];
        let interaction = null;
        let sourceLabel = null;
        let sourceDrug = null;

        // Check A's label for B
        if (labelA) {
            const text = extractInteractionText(labelA);
            if (text && checkTextForDrug(text, drugB)) {
                interaction = text;
                sourceLabel = text;
                sourceDrug = drugB;
            }
        }
        // Check B's label for A
        if (!interaction && labelB) {
            const text = extractInteractionText(labelB);
            if (text && checkTextForDrug(text, drugA)) {
                interaction = text;
                sourceLabel = text;
                sourceDrug = drugA;
            }
        }

        if (interaction) {
            foundAny = true;
            const severity = guessSeverity(sourceLabel, sourceDrug);
            const snippet = extractRelevantSnippet(sourceLabel, sourceDrug);
            const icons = { major: '🚨', moderate: '⚠️', minor: '💛', unknown: '❓' };
            html += `<div class="interaction-card ${severity}">
                <div class="interaction-header">
                    <span class="severity-badge ${severity}">${icons[severity]} ${severity}</span>
                    <span class="drug-pair">${drugA} + ${drugB}</span>
                </div>
                <div class="interaction-desc">${snippet || 'Interaction mentioned in drug label. Please consult your pharmacist for details.'}</div>
                <p style="margin-top:10px; font-size:0.82rem; color:#7f8c8d;">Source: FDA drug label database. Consult a pharmacist for full details.</p>
            </div>`;
        } else {
            const notFound = !labelA && !labelB;
            html += `<div class="no-interaction">
                ${notFound ? `⚠️ Could not retrieve label data for <strong>${drugA}</strong> or <strong>${drugB}</strong> from FDA database. This does not mean there are no interactions — please consult a pharmacist.` :
                `✅ No interaction found between <strong>${drugA}</strong> and <strong>${drugB}</strong> in the FDA label database.`}
            </div>`;
        }
    }

    if (!foundAny) {
        html += `<div class="card" style="text-align:center; color:#555; padding:24px;">
            <p>No interactions were found between the entered medications in the FDA label database. However, this does not guarantee safety. Always consult your pharmacist or doctor for a comprehensive review.</p>
        </div>`;
    }

    html += `<div class="card" style="background:#fff3cd; border:1px solid #ffc107; font-size:0.88rem; color:#856404; margin-top:8px;">
        <strong>⚕️ Important Reminder:</strong> This tool uses the OpenFDA drug label database and may not catch all interactions. Always verify with your pharmacist or physician before starting, stopping, or changing any medication.
    </div>`;

    document.getElementById('results-inner').innerHTML = html;
    resultsEl.classList.add('show');
    resultsEl.style.display = 'block';
}
