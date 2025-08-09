const display = document.getElementById('display');
const pad = document.querySelector('.buttons');

let buffer = '0';
let justEvaluated = false;
display.value = buffer;

const toJS = (s) => s
  .replace(/,/g, '.')
  .replace(/÷/g, '/')
  .replace(/×/g, '*')
  .replace(/−/g, '-');

const toLocal = (s) => s.replace(/\./g, ',');

const scrollRight = () => { requestAnimationFrame(() => display.scrollLeft = display.scrollWidth); };

const setDisplay = (s) => {
  buffer = s;
  display.value = s;
  scrollRight();
};

const appendDigit = (d) => {
  if (buffer === '0' || justEvaluated) {
    setDisplay(d);
  } else {
    setDisplay(buffer + d);
  }
  justEvaluated = false;
};

const appendOp = (op) => {
  const last = buffer.slice(-1);
  const isOp = /[+\-−×÷]/.test(last);
  if (isOp) {
    setDisplay(buffer.slice(0, -1) + op);
  } else {
    setDisplay(buffer + op);
  }
  justEvaluated = false;
};

const addDecimal = () => {
  const parts = buffer.split(/([+\-−×÷])/);
  const lastPart = parts[parts.length - 1];
  if (!lastPart.includes(',')) {
    setDisplay(buffer + ',');
  }
  justEvaluated = false;
};

const backspace = () => {
  if (justEvaluated) { setDisplay('0'); justEvaluated = false; return; }
  if (buffer.length <= 1) { setDisplay('0'); return; }
  setDisplay(buffer.slice(0, -1));
};

const clearAll = () => { setDisplay('0'); justEvaluated = false; };

const percent = () => {

  const regex = /(-?\d+(?:[.,]\d+)?)([+\-−×÷])(-?\d+(?:[.,]\d+)?)%?$/;
  const match = buffer.match(regex);
  if (!match) return;

  const [_, a, op, b] = match;
  const A = parseFloat(toJS(a));
  const B = parseFloat(toJS(b));

  if (isNaN(A) || isNaN(B)) return;

  const operators = {
    '+': A + A * (B / 100),
    '−': A - A * (B / 100),
    '-': A - A * (B / 100),
    '*': A * A * (B / 100),
    '×': A * A * (B / 100),
    '/': A / A * (B / 100),
    '÷': A / A * (B / 100)
  };

  const result = operators[op];
  if (typeof result === 'number' && isFinite(result)) {
    setDisplay(toLocal(String(result)));
    justEvaluated = true;
  }
};

const equals = () => {
  if (/[+\-−×÷]$/.test(buffer)) buffer = buffer.slice(0, -1);
  try {
    let expr = toJS(buffer);
    if (expr.includes('%')) expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '*($1/100)');
    if (!/^[\d.+\-*/\s()]+$/.test(expr)) return;

    const out = Function('"use strict";return (' + expr + ')')();
    if (typeof out === 'number' && isFinite(out)) {
      setDisplay(toLocal(String(out)));
      justEvaluated = true;
    }
  } catch (e) {}
};

pad.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  if (btn.dataset.num) return appendDigit(btn.dataset.num);
  if (btn.dataset.decimal !== undefined) return addDecimal();

  if (btn.dataset.op) {
    const map = { divide: '÷', multiply: '×', minus: '−', plus: '+' };
    return appendOp(map[btn.dataset.op]);
  }

  if (btn.dataset.action === 'backspace') return backspace();
  if (btn.dataset.action === 'clear') return clearAll();
  if (btn.dataset.action === 'percent') return percent();
  if (btn.dataset.action === 'equals') return equals();
});

scrollRight();
