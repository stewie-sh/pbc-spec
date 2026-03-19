import { el, highlight } from '../dom.js';
import type { PbcBlock } from '../parser.js';

export function renderActors(blocks: PbcBlock[]): HTMLElement | null {
  const actorBlocks = blocks.filter(b => b.type === 'actors');
  if (actorBlocks.length === 0) return null;

  const actors: Array<{ id: string; name: string; type: string; description: string }> = [];
  for (const block of actorBlocks) {
    const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const entry of entries) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        actors.push({
          id: String(obj.id || ''),
          name: String(obj.name || ''),
          type: String(obj.type || 'system'),
          description: String(obj.description || ''),
        });
      }
    }
  }

  if (actors.length === 0) return null;

  const grid = el('div', { className: 'card-grid' });

  for (const actor of actors) {
    const typeClass = `actor-type-${actor.type}`;
    const card = el('div', { className: 'card cross-ref', 'data-actor-id': actor.id },
      el('div', { style: 'display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-xs)' },
        el('span', { className: `actor-type ${typeClass}` }, actor.type),
      ),
      el('div', { className: 'card-title' }, actor.name),
      el('div', { className: 'card-id' }, actor.id),
      el('div', { className: 'card-desc' }, actor.description),
    );
    card.addEventListener('click', () => highlight('actor', actor.id));
    grid.appendChild(card);
  }

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, 'Actors'));
  section.appendChild(grid);
  return section;
}
