import { el } from '../dom.js';
import type { PbcBlock } from '../parser.js';

export function renderGlossary(blocks: PbcBlock[]): HTMLElement | null {
  const glossaryBlocks = blocks.filter(b => b.type === 'glossary');
  if (glossaryBlocks.length === 0) return null;

  const items: Array<{ term: string; definition: string }> = [];
  for (const block of glossaryBlocks) {
    const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const entry of entries) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        items.push({
          term: String(obj.term || ''),
          definition: String(obj.definition || ''),
        });
      }
    }
  }

  if (items.length === 0) return null;

  const dl = el('dl', { className: 'glossary-list' });
  for (const item of items) {
    dl.appendChild(el('dt', null, item.term));
    dl.appendChild(el('dd', null, item.definition));
  }

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, 'Glossary'));
  section.appendChild(dl);
  return section;
}
