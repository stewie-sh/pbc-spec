import { el } from '../dom.js';
import type { PbcBlock } from '../parser.js';

export function renderRules(blocks: PbcBlock[]): HTMLElement | null {
  const ruleBlocks = blocks.filter(b => b.type === 'rules');
  if (ruleBlocks.length === 0) return null;

  const rules: Array<{ id: string; name: string; rule: string }> = [];
  for (const block of ruleBlocks) {
    const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const entry of entries) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        rules.push({
          id: String(obj.id || '-'),
          name: String(obj.name || ''),
          rule: String(obj.rule || ''),
        });
      }
    }
  }

  if (rules.length === 0) return null;

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, `Rules (${rules.length})`));

  const toolbar = el('div', { className: 'section-toolbar' });
  const filterWrap = el('div', { className: 'section-filter' });
  const filterLabel = el('label', { className: 'section-filter-label' }, 'Filter');
  const filter = el('input', {
    className: 'section-filter-input',
    type: 'search',
    placeholder: 'Filter by id, name, rule\u2026',
    'aria-label': 'Filter rules',
  }) as HTMLInputElement;
  filterLabel.appendChild(filter);
  filterWrap.appendChild(filterLabel);
  toolbar.appendChild(filterWrap);
  section.appendChild(toolbar);

  const table = el('table', { className: 'pbc-table' });
  table.appendChild(
    el('colgroup', null,
      el('col', { className: 'rules-col-id' }),
      el('col', { className: 'rules-col-name' }),
      el('col', { className: 'rules-col-rule' }),
    ),
  );
  table.appendChild(
    el('thead', null,
      el('tr', null,
        el('th', { className: 'rules-cell-id' }, 'ID'),
        el('th', { className: 'rules-cell-name' }, 'Name'),
        el('th', { className: 'rules-cell-rule' }, 'Rule'),
      ),
    ),
  );

  const tbody = el('tbody');
  const rows: Array<{ node: HTMLElement; search: string }> = [];
  for (const rule of rules) {
    const row = el('tr', null,
      el('td', { className: 'rules-cell-id' }, el('code', null, rule.id)),
      el('td', { className: 'rules-cell-name', style: 'font-weight:500', title: rule.name }, rule.name),
      el('td', { className: 'rules-cell-rule' }, rule.rule),
    ) as HTMLElement;
    tbody.appendChild(row);
    rows.push({
      node: row,
      search: `${rule.id} ${rule.name} ${rule.rule}`.toLowerCase(),
    });
  }
  table.appendChild(tbody);

  const empty = el('div', { className: 'section-empty', style: 'display:none' }, 'No rules match.');
  section.appendChild(empty);
  section.appendChild(table);

  const applyFilter = () => {
    const q = filter.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const match = !q || row.search.includes(q);
      row.node.style.display = match ? '' : 'none';
      if (match) visible += 1;
    }
    empty.style.display = visible === 0 ? 'block' : 'none';
  };
  filter.addEventListener('input', applyFilter);
  filter.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      filter.value = '';
      applyFilter();
      filter.blur();
    }
  });

  return section;
}
