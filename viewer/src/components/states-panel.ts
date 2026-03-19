import { el, highlight } from '../dom.js';
import type { PbcBlock } from '../parser.js';
import { renderStateDiagram } from '../state-diagram.js';

interface StateEntry { id: string; definition: string; user_access: string; }
interface TransitionEntry { from: string; to: string; condition: string; }

export function renderStates(blocks: PbcBlock[]): HTMLElement | null {
  const stateBlocks = blocks.filter(b => b.type === 'states');
  if (stateBlocks.length === 0) return null;

  const states: StateEntry[] = [];
  for (const block of stateBlocks) {
    const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const entry of entries) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        states.push({
          id: String(obj.id || ''),
          definition: String(obj.definition || ''),
          user_access: String(obj.user_access || ''),
        });
      }
    }
  }

  if (states.length === 0) return null;

  // Collect transitions
  const transitions: TransitionEntry[] = [];
  for (const block of blocks.filter(b => b.type === 'transitions')) {
    const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const entry of entries) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        transitions.push({
          from: String(obj.from || ''),
          to: String(obj.to || ''),
          condition: String(obj.condition || ''),
        });
      }
    }
  }

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, 'States'));

  // Table
  const table = el('table', { className: 'pbc-table' });
  const thead = el('thead', null,
    el('tr', null,
      el('th', null, 'State'),
      el('th', null, 'Definition'),
      el('th', null, 'Access'),
    ),
  );
  table.appendChild(thead);

  const tbody = el('tbody');
  for (const state of states) {
    const accessIcon = state.user_access === 'full' ? '\u2705'
      : state.user_access === 'limited' ? '\u26a0\ufe0f'
      : '\u274c';
    const row = el('tr', { className: 'cross-ref', 'data-state-id': state.id },
      el('td', null, el('code', null, state.id)),
      el('td', null, state.definition),
      el('td', null, `${accessIcon} ${state.user_access}`),
    );
    row.addEventListener('click', () => highlight('state', state.id));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  section.appendChild(table);

  // Diagram
  if (transitions.length > 0) {
    const diagram = renderStateDiagram(states, transitions);
    section.appendChild(el('div', { className: 'state-diagram' }, diagram));
  }

  return section;
}
