import { el, highlight } from '../dom.js';
import type { PbcBlock } from '../parser.js';

interface BehaviorGroup {
  id: string;
  name: string;
  actor: string;
  description: string;
  preconditions: string[];
  trigger: string;
  outcomes: string[];
  events: Array<{ event: string; condition: string }>;
  transitions: Array<{ from: string; to: string; condition: string }>;
  exceptions: Array<{ name: string; handling: string }>;
}

const COMPANION_TYPES = new Set(['preconditions', 'trigger', 'outcomes', 'events', 'transitions', 'exceptions']);

export function renderBehaviors(blocks: PbcBlock[]): HTMLElement | null {
  // Group behaviors with their companion blocks
  const groups: BehaviorGroup[] = [];
  let current: BehaviorGroup | null = null;

  for (const block of blocks) {
    if (block.type === 'behavior') {
      const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
      for (const item of items) {
        if (typeof item !== 'object' || item === null) continue;
        const obj = item as Record<string, unknown>;
        current = {
          id: String(obj.id || ''),
          name: String(obj.name || ''),
          actor: String(obj.actor || ''),
          description: String(obj.description || ''),
          preconditions: [],
          trigger: '',
          outcomes: [],
          events: [],
          transitions: [],
          exceptions: [],
        };
        groups.push(current);
      }
    } else if (COMPANION_TYPES.has(block.type) && current) {
      if (block.type === 'preconditions') {
        current.preconditions = extractList(block.parsed);
      } else if (block.type === 'trigger') {
        current.trigger = typeof block.parsed === 'string' ? block.parsed : extractList(block.parsed).join(' ');
      } else if (block.type === 'outcomes') {
        current.outcomes = extractList(block.parsed);
      } else if (block.type === 'events') {
        const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
        for (const e of entries) {
          if (typeof e === 'object' && e !== null) {
            const obj = e as Record<string, unknown>;
            current.events.push({ event: String(obj.event || ''), condition: String(obj.condition || '') });
          }
        }
      } else if (block.type === 'transitions') {
        const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
        for (const t of entries) {
          if (typeof t === 'object' && t !== null) {
            const obj = t as Record<string, unknown>;
            current.transitions.push({ from: String(obj.from || ''), to: String(obj.to || ''), condition: String(obj.condition || '') });
          }
        }
      } else if (block.type === 'exceptions') {
        const entries = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
        for (const ex of entries) {
          if (typeof ex === 'object' && ex !== null) {
            const obj = ex as Record<string, unknown>;
            current.exceptions.push({ name: String(obj.name || ''), handling: String(obj.handling || '') });
          }
        }
      }
    } else if (!COMPANION_TYPES.has(block.type)) {
      current = null; // Reset association on non-companion blocks
    }
  }

  if (groups.length === 0) return null;

  const section = el('div', { className: 'section' });
  section.appendChild(el('div', { className: 'section-title' }, `Behaviors (${groups.length})`));

  for (const bhv of groups) {
    const card = el('div', { className: 'behavior-card' });

    // Header
    const header = el('div', { className: 'behavior-header' },
      el('span', { className: 'chevron' }, '\u25b6'),
      el('span', { className: 'bhv-id' }, bhv.id),
      el('span', { className: 'bhv-name' }, bhv.name),
    );

    if (bhv.actor) {
      const actorSpan = el('span', { className: 'bhv-actor cross-ref', 'data-actor-id': bhv.actor }, bhv.actor);
      actorSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        highlight('actor', bhv.actor);
      });
      header.appendChild(actorSpan);
    }

    header.addEventListener('click', () => card.classList.toggle('open'));
    card.appendChild(header);

    // Body
    const body = el('div', { className: 'behavior-body' });

    if (bhv.description) {
      body.appendChild(el('p', { style: 'font-size:0.88rem;color:var(--color-text-muted);margin-bottom:var(--space-sm)' }, bhv.description));
    }

    if (bhv.preconditions.length > 0) {
      body.appendChild(el('h4', null, 'Preconditions'));
      const ul = el('ul');
      for (const p of bhv.preconditions) ul.appendChild(el('li', null, p));
      body.appendChild(ul);
    }

    if (bhv.trigger) {
      body.appendChild(el('h4', null, 'Trigger'));
      body.appendChild(el('div', { className: 'trigger-text' }, bhv.trigger));
    }

    if (bhv.outcomes.length > 0) {
      body.appendChild(el('h4', null, 'Outcomes'));
      const ol = el('ol');
      for (const o of bhv.outcomes) ol.appendChild(el('li', null, o));
      body.appendChild(ol);
    }

    if (bhv.events.length > 0) {
      body.appendChild(el('h4', null, 'Events'));
      for (const ev of bhv.events) {
        body.appendChild(el('div', { style: 'margin-top:var(--space-xs)' },
          el('span', { className: 'event-tag' }, ev.event),
          el('span', { style: 'font-size:0.8rem;color:var(--color-text-muted)' }, ev.condition ? ` \u2014 ${ev.condition}` : ''),
        ));
      }
    }

    if (bhv.transitions.length > 0) {
      body.appendChild(el('h4', null, 'Transitions'));
      for (const t of bhv.transitions) {
        const fromRef = el('span', { className: 'state-ref cross-ref' }, t.from);
        const toRef = el('span', { className: 'state-ref cross-ref' }, t.to);
        fromRef.addEventListener('click', () => highlight('state', t.from));
        toRef.addEventListener('click', () => highlight('state', t.to));
        body.appendChild(el('div', { className: 'transition-arrow' },
          fromRef,
          el('span', { className: 'arrow' }, '\u2192'),
          toRef,
          el('span', { style: 'font-size:0.8rem;color:var(--color-text-muted);margin-left:var(--space-sm)' }, t.condition),
        ));
      }
    }

    if (bhv.exceptions.length > 0) {
      body.appendChild(el('h4', null, 'Exceptions'));
      for (const ex of bhv.exceptions) {
        body.appendChild(el('div', { className: 'exception-item' },
          el('strong', null, ex.name + ': '),
          el('span', null, ex.handling),
        ));
      }
    }

    card.appendChild(body);
    section.appendChild(card);
  }

  return section;
}

function extractList(parsed: unknown): string[] {
  if (Array.isArray(parsed)) return parsed.map(String);
  if (typeof parsed === 'string') return parsed.split('\n').map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean);
  return [];
}
