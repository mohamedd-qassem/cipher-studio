(function () {
  // ===== State =====
  const state = {
    algorithm: 'caesar',
    operation: 'encrypt',
    key: '3',
    text: ''
  };

  // ===== DOM refs =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const el = {
    algorithm: $('#algorithm'),
    algoDesc: $('#algo-description'),
    textInput: $('#text-input'),
    charCount: $('#char-count'),
    keyInput: $('#key-input'),
    keyLabel: $('#key-label'),
    toggleBtns: $$('.toggle-btn'),
    processBtn: $('#process-btn'),
    exampleBtn: $('#example-btn'),
    resetBtn: $('#reset-btn'),
    copyBtn: $('#copy-btn'),
    resultArea: $('#result-area'),
    resultActions: $('#result-actions'),
    messageArea: $('#message-area'),
    vizSection: $('#viz-section'),
    vizContent: $('#viz-content'),
    vizBadge: $('#viz-badge')
  };

  const algorithmMeta = {
    caesar: {
      name: 'Caesar Cipher',
      keyLabel: 'Shift (1-25)',
      keyMin: 1, keyMax: 25, keyDefault: 3,
      description: 'The Caesar cipher shifts each letter by a fixed number of positions in the alphabet. Named after Julius Caesar, it is one of the simplest and most widely known encryption techniques.',
      examples: [
        { text: 'HELLO', key: 3, op: 'encrypt' },
        { text: 'THE QUICK BROWN FOX', key: 5, op: 'encrypt' },
        { text: 'KHOOR', key: 3, op: 'decrypt' }
      ]
    },
    xor: {
      name: 'XOR Cipher',
      keyLabel: 'Key (0-255)',
      keyMin: 0, keyMax: 255, keyDefault: 75,
      description: 'The XOR cipher combines each character with a key using the bitwise XOR operation. It is symmetric — encryption and decryption use the same process.',
      examples: [
        { text: 'SECRET', key: 75, op: 'encrypt' },
        { text: 'HELLO', key: 42, op: 'encrypt' }
      ]
    },
    rail_fence: {
      name: 'Rail Fence Cipher',
      keyLabel: 'Rails (2-10)',
      keyMin: 2, keyMax: 10, keyDefault: 3,
      description: 'The Rail Fence cipher writes the message diagonally in a zigzag pattern across multiple rows (rails), then reads it off row by row to produce the ciphertext.',
      examples: [
        { text: 'HELLO WORLD', key: 3, op: 'encrypt' },
        { text: 'HOLN EWRDLOEL', key: 3, op: 'decrypt' }
      ]
    }
  };

  // ===== Init =====
  function init() {
    updateAlgorithmInfo();
    updateCharCount();
    bindEvents();
  }

  // ===== Events =====
  function bindEvents() {
    el.algorithm.addEventListener('change', onAlgorithmChange);
    el.textInput.addEventListener('input', onTextInput);
    el.toggleBtns.forEach(btn => btn.addEventListener('click', onToggleOperation));
    el.processBtn.addEventListener('click', onProcess);
    el.exampleBtn.addEventListener('click', onLoadExample);
    el.resetBtn.addEventListener('click', onReset);
    el.copyBtn.addEventListener('click', onCopyResult);
    el.keyInput.addEventListener('input', () => { state.key = el.keyInput.value; });
  }

  function onAlgorithmChange() {
    state.algorithm = el.algorithm.value;
    updateAlgorithmInfo();
    clearResult();
    hideVisualization();
    clearMessages();
  }

  function onTextInput() {
    state.text = el.textInput.value;
    updateCharCount();
  }

  function onToggleOperation(e) {
    el.toggleBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    state.operation = e.currentTarget.dataset.value;
    clearResult();
    hideVisualization();
  }

  function onReset() {
    el.textInput.value = '';
    state.text = '';
    const meta = algorithmMeta[state.algorithm];
    el.keyInput.value = meta.keyDefault;
    state.key = String(meta.keyDefault);
    el.toggleBtns.forEach(b => b.classList.remove('active'));
    el.toggleBtns[0].classList.add('active');
    state.operation = 'encrypt';
    updateCharCount();
    clearResult();
    hideVisualization();
    clearMessages();
    el.textInput.focus();
  }

  function onCopyResult() {
    const resultText = document.querySelector('.result-content');
    if (!resultText) return;
    navigator.clipboard.writeText(resultText.textContent).then(() => {
      showMessage('Copied to clipboard!', 'success');
    }).catch(() => {
      showMessage('Failed to copy', 'error');
    });
  }

  // ===== Algorithm Info =====
  function updateAlgorithmInfo() {
    const meta = algorithmMeta[state.algorithm];
    el.keyLabel.textContent = meta.keyLabel;
    el.keyInput.min = meta.keyMin;
    el.keyInput.max = meta.keyMax;
    el.keyInput.placeholder = `e.g. ${meta.keyDefault}`;
    if (!state.key || parseInt(state.key) < meta.keyMin || parseInt(state.key) > meta.keyMax) {
      el.keyInput.value = meta.keyDefault;
      state.key = String(meta.keyDefault);
    }
    el.algoDesc.textContent = meta.description;
  }

  function updateCharCount() {
    const len = el.textInput.value.length;
    el.charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
  }

  // ===== Process =====
  async function onProcess() {
    clearMessages();
    hideVisualization();

    const text = el.textInput.value.trim();
    const algorithm = el.algorithm.value;
    const operation = state.operation;
    const key = el.keyInput.value.trim();

    if (!text) {
      showMessage('Please enter a message to process.', 'error');
      el.textInput.focus();
      return;
    }

    if (!key) {
      showMessage('Please enter a key.', 'error');
      el.keyInput.focus();
      return;
    }

    const keyNum = parseInt(key, 10);
    if (isNaN(keyNum)) {
      showMessage('Key must be a valid integer.', 'error');
      return;
    }

    const meta = algorithmMeta[algorithm];
    if (keyNum < meta.keyMin || keyNum > meta.keyMax) {
      showMessage(`Key must be between ${meta.keyMin} and ${meta.keyMax}.`, 'error');
      return;
    }

    el.processBtn.disabled = true;
    el.processBtn.textContent = 'Processing...';

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, algorithm, operation, key: String(keyNum) })
      });

      const data = await res.json();

      if (!data.success) {
        showMessage(data.error || 'An unknown error occurred.', 'error');
        el.processBtn.disabled = false;
        el.processBtn.textContent = 'Process';
        return;
      }

      displayResult(data);
      if (data.steps) {
        renderVisualization(data);
      }
    } catch (err) {
      showMessage('Network error. Is the server running?', 'error');
    }

    el.processBtn.disabled = false;
    el.processBtn.textContent = 'Process';
  }

  // ===== Display Result =====
  function displayResult(data) {
    const opLabel = data.operation === 'encrypt' ? 'Encrypted' : 'Decrypted';
    const icon = data.operation === 'encrypt' ? '\u{1F512}' : '\u{1F513}';

    el.resultArea.innerHTML = `
      <div class="result-meta">
        <span><strong>Algorithm:</strong> ${data.algorithm}</span>
        <span><strong>Operation:</strong> ${data.operation}</span>
        <span><strong>Key:</strong> ${data.key}</span>
      </div>
      <div class="result-content">${escapeHtml(data.result_text)}</div>
    `;
    el.resultActions.style.display = 'block';
  }

  function clearResult() {
    el.resultArea.innerHTML = `
      <div class="result-placeholder">
        <span class="placeholder-icon">&#x1F50D;</span>
        <p>Process a message to see the result here.</p>
      </div>
    `;
    el.resultActions.style.display = 'none';
  }

  // ===== Visualization =====
  function renderVisualization(data) {
    const steps = data.steps;
    el.vizBadge.textContent = `${data.algorithm} \u2022 ${data.operation}`;

    if (steps.type === 'caesar') {
      renderCaesarViz(steps);
    } else if (steps.type === 'xor') {
      renderXorViz(steps);
    } else if (steps.type === 'rail_fence') {
      renderRailFenceViz(steps, data.operation);
    }

    el.vizSection.style.display = 'block';
    el.vizSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideVisualization() {
    el.vizSection.style.display = 'none';
    el.vizContent.innerHTML = '';
  }

  // -- Caesar --
  function renderCaesarViz(steps) {
    const alphabet = steps.alphabet.split('');
    const shifted = steps.shifted_alphabet.split('');
    const shift = steps.shift;
    const charSteps = steps.character_steps;

    let html = '<div class="caesar-viz">';

    // Alphabet shift display
    html += '<div class="alphabet-shift-display">';
    html += `<h4>Shift: ${shift} positions to the right</h4>`;
    html += '<div class="alphabet-rows">';

    // Original alphabet
    html += '<div class="alphabet-row">';
    alphabet.forEach((ch, i) => {
      const cls = i === shift ? 'alphabet-char original highlight' : 'alphabet-char original';
      html += `<div class="${cls}">${ch}</div>`;
    });
    html += '</div>';

    // Arrow
    html += '<div class="shift-arrow">&darr; Shift &darr;</div>';

    // Shifted alphabet
    html += '<div class="alphabet-row">';
    alphabet.forEach((ch, i) => {
      const shiftedChar = shifted[i];
      const isChanged = ch !== shiftedChar;
      const cls = isChanged ? 'alphabet-char shifted' : 'alphabet-char shifted';
      html += `<div class="${cls}">${shiftedChar}</div>`;
    });
    html += '</div>';

    html += '</div></div>';

    // Per-character table
    html += '<div class="char-table-wrapper"><table class="char-table"><thead><tr>';
    html += '<th>Character</th><th>Index</th><th>Shifted Index</th><th>Result</th>';
    html += '</tr></thead><tbody>';

    charSteps.forEach(s => {
      if (s.index === null) {
        html += `<tr><td class="non-letter">${escapeHtml(s.char)}</td><td class="non-letter">&mdash;</td><td class="non-letter">&mdash;</td><td class="non-letter">${escapeHtml(s.result)}</td></tr>`;
      } else {
        html += `<tr><td>${escapeHtml(s.char)}</td><td>${s.index}</td><td>${s.shifted_index}</td><td>${escapeHtml(s.result)}</td></tr>`;
      }
    });

    html += '</tbody></table></div></div>';

    el.vizContent.innerHTML = html;
  }

  // -- XOR --
  function renderXorViz(steps) {
    const charSteps = steps.character_steps;

    let html = '<div class="xor-viz">';

    // Formula
    html += '<div class="xor-formula">';
    html += `Each character \u2295 <span class="highlight-key">${steps.key}</span> = result`;
    html += '</div>';

    // Table
    html += '<div class="xor-table-wrapper"><table class="xor-table"><thead><tr>';
    html += '<th>Char</th><th>ASCII</th><th>Binary</th><th>Key Bin</th><th>XOR Bin</th><th>Result</th>';
    html += '</tr></thead><tbody>';

    charSteps.forEach(s => {
      const resultDisplay = s.is_printable ? escapeHtml(s.result_char) : `<span class="non-printable">(0x${s.xor_ascii.toString(16).toUpperCase().padStart(2, '0')})</span>`;
      html += `<tr>
        <td class="col-char">${escapeHtml(s.char)}</td>
        <td class="col-ascii">${s.ascii}</td>
        <td class="col-binary">${s.binary}</td>
        <td class="col-key-binary">${s.key_binary}</td>
        <td class="col-xor-binary">${s.xor_binary}</td>
        <td class="col-result">${resultDisplay}</td>
      </tr>`;
    });

    html += '</tbody></table></div></div>';

    el.vizContent.innerHTML = html;
  }

  // -- Rail Fence --
  function renderRailFenceViz(steps, operation) {
    const matrix = steps.rail_matrix;
    const rails = steps.rails;
    const positions = steps.positions || [];

    let html = '<div class="rail-viz">';

    // Info
    html += `<div class="rail-info">${operation === 'encrypt' ? 'Encryption' : 'Decryption'} with <strong>${rails}</strong> rail${rails > 1 ? 's' : ''} &mdash; text length: ${steps.text_length} characters</div>`;

    // Rail matrix
    html += '<div class="rail-matrix-wrapper"><div class="rail-matrix">';
    matrix.forEach((row, ri) => {
      html += '<div class="rail-row">';
      html += `<span class="rail-label">R${ri}</span>`;
      row.forEach((cell, ci) => {
        const isFilled = cell !== '.';
        const cls = isFilled ? 'rail-cell filled' : 'rail-cell';
        const railAttr = isFilled ? ` data-rail="${ri}"` : '';
        html += `<div class="${cls}"${railAttr}>${isFilled ? escapeHtml(cell) : ''}</div>`;
      });
      html += '</div>';
    });
    html += '</div></div>';

    // Position table
    if (positions.length > 0) {
      html += '<div class="rail-positions"><table><thead><tr>';
      html += '<th>Pos</th><th>Char</th><th>Rail</th><th>Rail Pos</th>';
      if (operation === 'encrypt') html += '<th>Read Order</th>';
      html += '</tr></thead><tbody>';

      // For encrypt: compute read order
      let readOrderMap = {};
      if (operation === 'encrypt') {
        let idx = 0;
        for (let r = 0; r < rails; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== '.') {
              for (let pi = 0; pi < positions.length; pi++) {
                if (positions[pi].rail === r && positions[pi].rail_pos === c) {
                  readOrderMap[pi] = idx++;
                  break;
                }
              }
            }
          }
        }
      }

      positions.forEach((p, i) => {
        html += `<tr>
          <td class="pos-col">${i}</td>
          <td class="char-col">${escapeHtml(p.char)}</td>
          <td class="pos-col">${p.rail}</td>
          <td class="pos-col">${p.rail_pos}</td>`;
        if (operation === 'encrypt') {
          html += `<td class="pos-col">${readOrderMap[i] !== undefined ? readOrderMap[i] : '-'}</td>`;
        }
        html += '</tr>';
      });

      html += '</tbody></table></div>';
    }

    html += '</div>';
    el.vizContent.innerHTML = html;
  }

  // ===== Example =====
  function onLoadExample() {
    const meta = algorithmMeta[state.algorithm];
    const examples = meta.examples;
    const ex = examples[Math.floor(Math.random() * examples.length)];

    el.textInput.value = ex.text;
    state.text = ex.text;
    updateCharCount();

    el.keyInput.value = ex.key;
    state.key = String(ex.key);

    el.toggleBtns.forEach(b => b.classList.remove('active'));
    const targetOp = ex.op;
    el.toggleBtns.forEach(b => {
      if (b.dataset.value === targetOp) b.classList.add('active');
    });
    state.operation = targetOp;

    clearResult();
    hideVisualization();
    clearMessages();
  }

  // ===== Utility =====
  function showMessage(msg, type) {
    const icon = type === 'success' ? '\u2705' : '\u274C';
    el.messageArea.innerHTML = `<div class="alert alert-${type}"><span class="alert-icon">${icon}</span> ${escapeHtml(msg)}</div>`;
    setTimeout(() => { el.messageArea.innerHTML = ''; }, 4000);
  }

  function clearMessages() {
    el.messageArea.innerHTML = '';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', init);
})();
