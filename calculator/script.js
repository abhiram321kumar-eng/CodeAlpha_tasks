(function () {
  const SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');

  let current = '0';          // number being typed (string)
  let previous = null;        // stored left operand (number)
  let operator = null;        // pending operator
  let justEvaluated = false;
  let error = false;
  let waitingForOperand = false;

  function compute(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
    }
    return b;
  }

  function format(n) {
    if (!isFinite(n)) return 'Error';
    let s = String(parseFloat(n.toPrecision(12)));   // trims 0.1+0.2 noise
    if (s.includes('e')) return s;
    const [int, dec] = s.split('.');
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? withCommas + '.' + dec : withCommas;
  }

  function displayTyped(str) {
    const neg = str.startsWith('-');
    const raw = neg ? str.slice(1) : str;
    const [int, dec] = raw.split('.');
    const out = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec !== undefined ? '.' + dec : '');
    return (neg ? '-' : '') + out;
  }

  function render() {
    resultEl.classList.toggle('error', error);
    resultEl.textContent = error ? "Can't divide by 0" : displayTyped(current);
    exprEl.textContent = previous !== null && operator
      ? `${format(previous)} ${SYMBOL[operator]}`
      : '';
    document.querySelectorAll('.key.op').forEach(b =>
      b.classList.toggle('active', b.dataset.op === operator && waitingForOperand)
    );
  }

  function reset() {
    current = '0'; previous = null; operator = null;
    justEvaluated = false; error = false; waitingForOperand = false;
    render();
  }

  // Real-time preview while typing the second number
  function liveResult() {
    if (previous !== null && operator && !waitingForOperand) {
      const val = compute(previous, operator, parseFloat(current));
      exprEl.textContent = `${format(previous)} ${SYMBOL[operator]} ${displayTyped(current)} = ` +
        (isFinite(val) ? format(val) : 'Error');
    }
  }

  function inputDigit(d) {
    if (error) reset();
    if (justEvaluated) { current = '0'; previous = null; operator = null; justEvaluated = false; }
    if (waitingForOperand) { current = '0'; waitingForOperand = false; }
    if (current.replace(/[-.]/g, '').length >= 15) return;
    current = current === '0' ? d : current + d;
    render();
    liveResult();
  }

  function inputDecimal() {
    if (error) reset();
    if (justEvaluated) { current = '0'; previous = null; operator = null; justEvaluated = false; }
    if (waitingForOperand) { current = '0'; waitingForOperand = false; }
    if (!current.includes('.')) current += '.';
    render();
  }

  function chooseOperator(op) {
    if (error) return;
    const value = parseFloat(current);
    if (previous !== null && operator && !waitingForOperand && !justEvaluated) {
      const res = compute(previous, operator, value);
      if (!isFinite(res)) { error = true; render(); return; }
      previous = res;
      current = String(res);
    } else {
      previous = value;
    }
    operator = op;
    justEvaluated = false;
    waitingForOperand = true;
    render();
  }

  function equals() {
    if (error || previous === null || !operator) return;
    const b = parseFloat(current);
    const res = compute(previous, operator, b);
    if (!isFinite(res)) { error = true; render(); return; }
    exprEl.textContent = `${format(previous)} ${SYMBOL[operator]} ${format(b)} =`;
    current = String(parseFloat(res.toPrecision(12)));
    previous = null; operator = null;
    justEvaluated = true; waitingForOperand = false;
    resultEl.classList.remove('error');
    resultEl.textContent = format(res);
    document.querySelectorAll('.key.op').forEach(btn => btn.classList.remove('active'));
  }

  function backspace() {
    if (error) { reset(); return; }
    if (justEvaluated || waitingForOperand) return;
    current = current.length > 1 && !(current.length === 2 && current.startsWith('-'))
      ? current.slice(0, -1) : '0';
    render();
    liveResult();
  }

  function percent() {
    if (error) return;
    current = String(parseFloat((parseFloat(current) / 100).toPrecision(12)));
    waitingForOperand = false;
    render();
    liveResult();
  }

  // ----- Mouse / touch -----
  document.querySelector('.keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;
    if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
    else if (btn.dataset.op) chooseOperator(btn.dataset.op);
    else {
      switch (btn.dataset.action) {
        case 'clear': reset(); break;
        case 'backspace': backspace(); break;
        case 'decimal': inputDecimal(); break;
        case 'percent': percent(); break;
        case 'equals': equals(); break;
      }
    }
  });

  // ----- Keyboard support -----
  function flash(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('pressed');
    setTimeout(() => el.classList.remove('pressed'), 110);
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { inputDigit(k); flash(`[data-num="${k}"]`); }
    else if (k === '.' || k === ',') { inputDecimal(); flash('[data-action="decimal"]'); }
    else if (['+', '-', '*', '/'].includes(k)) {
      e.preventDefault(); chooseOperator(k); flash(`[data-op="${k}"]`);
    }
    else if (k === 'x' || k === 'X') { chooseOperator('*'); flash('[data-op="*"]'); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); flash('[data-action="equals"]'); }
    else if (k === 'Backspace') { backspace(); flash('[data-action="backspace"]'); }
    else if (k === 'Escape' || k === 'Delete') { reset(); flash('[data-action="clear"]'); }
    else if (k === '%') { percent(); flash('[data-action="percent"]'); }
  });

  // ----- Theme toggle -----
  document.getElementById('theme').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme === 'dark' ||
      (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = isDark ? 'light' : 'dark';
  });

  render();
})();