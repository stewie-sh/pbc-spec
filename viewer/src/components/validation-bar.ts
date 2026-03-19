import { el } from '../dom.js';
import type { CheckResult } from '../validator.js';

export function renderValidationBar(results: CheckResult[]): HTMLElement {
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');

  const bar = el('div', { className: `validation-bar${errors.length > 0 ? ' has-errors' : ''}` });

  const summary = el('div', { className: 'summary' });

  if (errors.length === 0 && warnings.length === 0) {
    summary.appendChild(el('span', { className: 'count-ok' }, 'All checks passed'));
  } else {
    if (errors.length > 0) {
      summary.appendChild(el('span', { className: 'count-error' }, `${errors.length} error${errors.length !== 1 ? 's' : ''}`));
    }
    if (warnings.length > 0) {
      summary.appendChild(el('span', { className: 'count-warning' }, `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`));
    }
    summary.appendChild(el('span', { style: 'color:var(--color-text-muted);font-size:0.78rem' }, 'click to expand'));
  }

  bar.appendChild(summary);

  if (results.length > 0) {
    const details = el('div', { className: 'details', style: 'display:none' });
    for (const r of results) {
      const icon = r.severity === 'error' ? '\u2717' : '\u26a0';
      const color = r.severity === 'error' ? 'var(--color-error)' : 'var(--color-warning)';
      details.appendChild(
        el('div', { className: 'check-item' },
          el('span', { className: 'check-id' }, r.checkId),
          el('span', { style: `color:${color}` }, icon),
          el('span', null, r.message),
        ),
      );
    }

    let open = false;
    summary.addEventListener('click', () => {
      open = !open;
      details.style.display = open ? 'block' : 'none';
    });

    bar.appendChild(details);
  }

  return bar;
}
