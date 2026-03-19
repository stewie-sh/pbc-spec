import { onHighlight } from './dom.js';

interface State { id: string; definition: string; user_access: string; }
interface Transition { from: string; to: string; condition: string; }
interface NodePos { id: string; x: number; y: number; w: number; h: number; }

const NS = 'http://www.w3.org/2000/svg';
const NODE_H = 36;
const NODE_PAD = 16;
const FONT_SIZE = 12;

function measureText(text: string): number {
  return text.length * FONT_SIZE * 0.62 + NODE_PAD * 2;
}

export function renderStateDiagram(states: State[], transitions: Transition[]): SVGSVGElement {
  const n = states.length;
  if (n === 0) return createSvg(0, 0);

  // Layout: circular arrangement
  const radiusX = Math.max(120, n * 40);
  const radiusY = Math.max(80, n * 28);
  const cx = radiusX + 80;
  const cy = radiusY + 50;

  const nodes: NodePos[] = states.map((s, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
    const w = measureText(s.id);
    return {
      id: s.id,
      x: cx + radiusX * Math.cos(angle),
      y: cy + radiusY * Math.sin(angle),
      w,
      h: NODE_H,
    };
  });

  const svgW = cx * 2 + 40;
  const svgH = cy * 2 + 40;
  const svg = createSvg(svgW, svgH);

  // Arrowhead marker
  const defs = svgEl('defs');
  const marker = svgEl('marker', {
    id: 'arrowhead', viewBox: '0 0 10 10', refX: '10', refY: '5',
    markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse',
  });
  marker.appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: 'var(--color-text-muted)' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const nodeMap = new Map<string, NodePos>();
  for (const node of nodes) nodeMap.set(node.id, node);

  // Render edges first (behind nodes)
  for (const t of transitions) {
    const from = nodeMap.get(t.from);
    const to = nodeMap.get(t.to);
    if (!from || !to) continue;

    const g = svgEl('g', { class: 'edge', 'data-from': t.from, 'data-to': t.to });

    if (t.from === t.to) {
      // Self-loop
      const loopR = 20;
      const path = svgEl('path', {
        d: `M ${from.x - 10} ${from.y - from.h / 2} C ${from.x - 10} ${from.y - from.h / 2 - loopR * 2}, ${from.x + 10} ${from.y - from.h / 2 - loopR * 2}, ${from.x + 10} ${from.y - from.h / 2}`,
        'marker-end': 'url(#arrowhead)',
      });
      g.appendChild(path);
      // Label above loop
      const label = svgEl('text', { x: String(from.x), y: String(from.y - from.h / 2 - loopR * 1.6) });
      label.textContent = truncate(t.condition, 30);
      g.appendChild(label);
    } else {
      // Curved edge
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;
      // Start/end at node border
      const sx = from.x + ux * (from.w / 2);
      const sy = from.y + uy * (from.h / 2);
      const ex = to.x - ux * (to.w / 2 + 8);
      const ey = to.y - uy * (to.h / 2 + 8);
      // Slight curve via perpendicular offset
      const perpX = -uy * 20;
      const perpY = ux * 20;
      const mx = (sx + ex) / 2 + perpX;
      const my = (sy + ey) / 2 + perpY;

      const path = svgEl('path', {
        d: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`,
        'marker-end': 'url(#arrowhead)',
      });
      g.appendChild(path);

      // Label at midpoint
      const lx = (sx + 2 * mx + ex) / 4;
      const ly = (sy + 2 * my + ey) / 4 - 6;
      const label = svgEl('text', { x: String(lx), y: String(ly) });
      label.textContent = truncate(t.condition, 25);
      g.appendChild(label);
    }

    svg.appendChild(g);
  }

  // Render nodes
  for (const node of nodes) {
    const g = svgEl('g', { class: 'state-node', 'data-state-id': node.id });
    g.style.cursor = 'pointer';
    g.appendChild(svgEl('rect', {
      x: String(node.x - node.w / 2),
      y: String(node.y - node.h / 2),
      width: String(node.w),
      height: String(node.h),
    }));
    const text = svgEl('text', { x: String(node.x), y: String(node.y) });
    text.textContent = node.id;
    g.appendChild(text);
    svg.appendChild(g);
  }

  // Highlight system
  onHighlight((detail) => {
    const allNodes = svg.querySelectorAll('.state-node');
    const allEdges = svg.querySelectorAll('.edge');

    if (!detail || detail.type !== 'state') {
      allNodes.forEach(n => { n.classList.remove('highlighted', 'dimmed'); });
      allEdges.forEach(e => { e.classList.remove('highlighted', 'dimmed'); });
      return;
    }

    const id = detail.id;
    allNodes.forEach(n => {
      const nid = n.getAttribute('data-state-id');
      n.classList.toggle('highlighted', nid === id);
      n.classList.toggle('dimmed', nid !== id);
    });
    allEdges.forEach(e => {
      const from = e.getAttribute('data-from');
      const to = e.getAttribute('data-to');
      const related = from === id || to === id;
      e.classList.toggle('highlighted', related);
      e.classList.toggle('dimmed', !related);
    });
    // Un-dim nodes that are targets/sources of highlighted edges
    allEdges.forEach(e => {
      if (e.classList.contains('highlighted')) {
        const from = e.getAttribute('data-from')!;
        const to = e.getAttribute('data-to')!;
        allNodes.forEach(n => {
          const nid = n.getAttribute('data-state-id');
          if (nid === from || nid === to) n.classList.remove('dimmed');
        });
      }
    });
  });

  return svg;
}

function createSvg(w: number, h: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  return svg;
}

function svgEl(tag: string, attrs?: Record<string, string>): SVGElement {
  const element = document.createElementNS(NS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) element.setAttribute(k, v);
  }
  return element;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + '\u2026' : s;
}
