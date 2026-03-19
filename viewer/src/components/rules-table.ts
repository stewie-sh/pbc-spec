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

  const table = el('table', { className: 'pbc-table' });
  table.appendChild(
    el('thead', null,
      el('tr', null,
        el('th', null, 'ID'),
        el('th', null, 'Name'),
        el('th', null, 'Rule'),
      ),
    ),
  );

  const tbody = el('tbody');
  for (const rule of rules) {
    tbody.appendChild(
      el('tr', null,
        el('td', null, el('code', null, rule.id)),
        el('td', { style: 'font-weight:500' }, rule.name),
        el('td', null, rule.rule),
      ),
    );
  }
  table.appendChild(tbody);

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, `Rules (${rules.length})`));
  section.appendChild(table);
  return section;
}
