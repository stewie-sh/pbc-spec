import { el } from '../dom.js';
import type { CheckResult } from '../validator.js';

export function renderValidationBar(
  results: CheckResult[],
  opts: { onSelect?: (result: CheckResult) => void } = {},
): HTMLElement {
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
    if (opts.onSelect && errors.length > 0 && errors[0].line) {
      const jump = el('button', { className: 'jump-first-error', title: 'Jump to first error' }, 'jump to first error');
      jump.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.onSelect?.(errors[0]);
      });
      summary.appendChild(jump);
    } else {
      summary.appendChild(el('span', { style: 'color:var(--color-text-muted);font-size:0.78rem' }, 'click to expand'));
    }
  }

  bar.appendChild(summary);

  if (results.length > 0) {
    const details = el('div', { className: 'details', style: 'display:none' });
    for (const r of results) {
      const icon = r.severity === 'error' ? '\u2717' : '\u26a0';
      const color = r.severity === 'error' ? 'var(--color-error)' : 'var(--color-warning)';
      const hasLine = typeof r.line === 'number' && r.line > 0;
      const isClickable = Boolean(opts.onSelect && hasLine);
      const item = el('div', { className: `check-item${isClickable ? ' clickable' : ''}` },
        el('span', { className: 'check-id' }, r.checkId),
        el('span', { style: `color:${color}` }, icon),
        el('span', null, r.message),
        hasLine ? el('span', { className: 'check-line' }, `L${r.line}`) : null,
      );

      if (isClickable) {
        item.setAttribute('role', 'button');
        item.tabIndex = 0;
        item.addEventListener('click', () => opts.onSelect?.(r));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            opts.onSelect?.(r);
          }
        });
      }

      details.appendChild(item);
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
