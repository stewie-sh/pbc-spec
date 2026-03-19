import { el } from '../dom.js';
import type { PbcBlock } from '../parser.js';

export function renderConfig(blocks: PbcBlock[]): HTMLElement | null {
  const configBlocks = blocks.filter(b => b.type === 'config');
  if (configBlocks.length === 0) return null;

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, 'Configuration'));

  for (const block of configBlocks) {
    const parsed = block.parsed;
    if (typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      if (obj.domain) {
        section.appendChild(el('div', { style: 'font-size:0.82rem;color:var(--color-text-muted);margin-bottom:var(--space-sm)' },
          `Domain: `,
          el('code', null, String(obj.domain)),
        ));
      }
      const tree = el('div', { className: 'config-tree' });
      renderObject(tree, obj.objects ?? obj, 0);
      section.appendChild(tree);
    }
  }

  return section;
}

function renderObject(parent: HTMLElement, obj: unknown, depth: number) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    // Leaf value
    const valueStr = Array.isArray(obj) ? `[${(obj as unknown[]).join(', ')}]` : String(obj);
    parent.appendChild(el('span', { className: 'value' }, valueStr));
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const details = document.createElement('details');
      if (depth < 2) details.open = true;
      const summary = document.createElement('summary');
      summary.textContent = key;
      details.appendChild(summary);
      renderObject(details, value, depth + 1);
      parent.appendChild(details);
    } else {
      const leaf = el('div', { className: 'leaf' },
        el('span', { className: 'key' }, `${key}: `),
      );
      renderObject(leaf, value, depth + 1);
      parent.appendChild(leaf);
    }
  }
}
