/** Tiny DOM helper — creates an element with optional attrs and children. */
export function el(
  tag: string,
  attrs?: Record<string, string> | null,
  ...children: (Node | string)[]
): HTMLElement {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') element.className = v;
      else if (k.startsWith('data-')) element.setAttribute(k, v);
      else element.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else element.appendChild(child);
  }
  return element;
}

/** Dispatch a cross-reference highlight event. */
export function highlight(type: string, id: string) {
  document.dispatchEvent(new CustomEvent('pbc:highlight', { detail: { type, id } }));
}

/** Clear all highlights. */
export function clearHighlight() {
  document.dispatchEvent(new CustomEvent('pbc:highlight', { detail: null }));
}

/** Listen for highlight events. */
export function onHighlight(callback: (detail: { type: string; id: string } | null) => void) {
  document.addEventListener('pbc:highlight', ((e: CustomEvent) => callback(e.detail)) as EventListener);
}
