import { el } from '../dom.js';
import type { PbcFrontmatter } from '../parser.js';

const STATUS_CLASS: Record<string, string> = {
  draft: 'badge-draft',
  review: 'badge-review',
  agreed: 'badge-agreed',
  deprecated: 'badge-deprecated',
};

function formatUpdated(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.valueOf())) return d.toISOString().slice(0, 10);
  return s;
}

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
  const primary = el('div', { className: 'meta-row meta-row-primary' });
  const secondary = el('div', { className: 'meta-row meta-row-secondary' });

  if (fm.status) {
    const cls = STATUS_CLASS[fm.status] || 'badge-draft';
    primary.appendChild(el('span', { className: `badge ${cls}` }, fm.status));
  }

  const updated = formatUpdated(fm.updated);
  if (updated) primary.appendChild(el('span', { className: 'badge badge-date' }, updated));

  if (fm.id) secondary.appendChild(el('span', { className: 'badge badge-id' }, fm.id));
  if (fm.context) secondary.appendChild(el('span', { className: 'badge badge-context' }, fm.context));

  if (fm.tags && Array.isArray(fm.tags) && fm.tags.length > 0) {
    const tags = fm.tags.map(t => String(t)).filter(Boolean);
    const tagsRow = el('div', { className: 'meta-tags' });

    const visible = tags.slice(0, 2);
    const hidden = tags.slice(2);

    for (const tag of visible) tagsRow.appendChild(el('span', { className: 'badge badge-tag' }, tag));

    if (hidden.length > 0) {
      const toggle = el('button', { className: 'tag-more', title: 'Show all tags' }, `+${hidden.length} tags`);
      toggle.addEventListener('click', () => {
        const open = tagsRow.classList.toggle('open');
        toggle.textContent = open ? 'hide tags' : `+${hidden.length} tags`;
        toggle.title = open ? 'Hide tags' : 'Show all tags';
      });
      tagsRow.appendChild(toggle);
      for (const tag of hidden) tagsRow.appendChild(el('span', { className: 'badge badge-tag tag-hidden' }, tag));
    }

    secondary.appendChild(tagsRow);
  }

  meta.appendChild(primary);
  if (secondary.childNodes.length > 0) meta.appendChild(secondary);

  return el('div', { className: 'doc-header' },
    el('h1', null, fm.title || 'Untitled PBC'),
    meta,
  );
}
