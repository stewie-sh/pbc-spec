import { el } from '../dom.js';
import type { PbcFrontmatter } from '../parser.js';

const STATUS_CLASS: Record<string, string> = {
  draft: 'badge-draft',
  review: 'badge-review',
  agreed: 'badge-agreed',
  deprecated: 'badge-deprecated',
};

export function renderHeader(fm: PbcFrontmatter | null): HTMLElement {
  if (!fm) {
    return el('div', { className: 'doc-header' },
      el('h1', null, 'Untitled PBC'),
      el('div', { className: 'meta' },
        el('span', { className: 'badge badge-draft' }, 'no frontmatter'),
      ),
    );
  }

  const meta = el('div', { className: 'meta' });

  if (fm.status) {
    const cls = STATUS_CLASS[fm.status] || 'badge-draft';
    meta.appendChild(el('span', { className: `badge ${cls}` }, fm.status));
  }

  if (fm.id) {
    meta.appendChild(el('span', { className: 'badge badge-id' }, fm.id));
  }

  if (fm.context) {
    meta.appendChild(el('span', { className: 'badge badge-tag' }, fm.context));
  }

  if (fm.updated) {
    meta.appendChild(el('span', { className: 'badge badge-id' }, String(fm.updated)));
  }

  if (fm.tags && Array.isArray(fm.tags)) {
    for (const tag of fm.tags) {
      meta.appendChild(el('span', { className: 'badge badge-tag' }, String(tag)));
    }
  }

  return el('div', { className: 'doc-header' },
    el('h1', null, fm.title || 'Untitled PBC'),
    meta,
  );
}
