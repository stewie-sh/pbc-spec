import './styles/tokens.css';
import './styles/reset.css';
import './styles/layout.css';
import './styles/components.css';

import { parseString } from './parser.js';
import { validate } from './validator.js';
import { renderHeader } from './components/header.js';
import { renderValidationBar } from './components/validation-bar.js';
import { renderGlossary } from './components/glossary-panel.js';
import { renderActors } from './components/actors-panel.js';
import { renderStates } from './components/states-panel.js';
import { renderBehaviors } from './components/behaviors-panel.js';
import { renderRules } from './components/rules-table.js';
import { renderConfig } from './components/config-tree.js';
import { clearHighlight } from './dom.js';

const EXAMPLES: Array<{ name: string; file: string }> = [
  { name: 'Billing & Subscriptions', file: 'billing.pbc.md' },
  { name: 'Sign-in & Session Access', file: 'auth-signin-session-access.pbc.md' },
  { name: 'Workspaces & Roles', file: 'workspaces-roles.pbc.md' },
];

let currentRaw = '';

function init() {
  const app = document.getElementById('app')!;
  app.innerHTML = '';
  app.className = 'app';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  const titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between';
  const title = document.createElement('h2');
  title.textContent = 'PBC Viewer';
  titleRow.appendChild(title);

  const themeBtn = document.createElement('button');
  themeBtn.className = 'theme-toggle';
  themeBtn.textContent = '\u263e';
  themeBtn.title = 'Toggle theme';
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.textContent = isDark ? '\u263e' : '\u2600';
  });
  titleRow.appendChild(themeBtn);
  sidebar.appendChild(titleRow);

  // Example selector
  const selectLabel = document.createElement('label');
  selectLabel.textContent = 'Load example';
  selectLabel.style.cssText = 'font-size:0.82rem;font-weight:500;color:var(--color-text-muted)';
  sidebar.appendChild(selectLabel);

  const select = document.createElement('select');
  const defaultOpt = document.createElement('option');
  defaultOpt.textContent = 'Choose an example\u2026';
  defaultOpt.value = '';
  select.appendChild(defaultOpt);
  for (const ex of EXAMPLES) {
    const opt = document.createElement('option');
    opt.value = ex.file;
    opt.textContent = ex.name;
    select.appendChild(opt);
  }
  select.addEventListener('change', async () => {
    if (!select.value) return;
    try {
      const resp = await fetch(`examples/${select.value}`);
      const text = await resp.text();
      textarea.value = text;
      currentRaw = text;
      renderDocument(text, viewer);
    } catch (err) {
      console.error('Failed to load example:', err);
    }
  });
  sidebar.appendChild(select);

  // Paste area
  const pasteLabel = document.createElement('label');
  pasteLabel.textContent = 'Or paste .pbc.md content';
  pasteLabel.style.cssText = 'font-size:0.82rem;font-weight:500;color:var(--color-text-muted)';
  sidebar.appendChild(pasteLabel);

  const textarea = document.createElement('textarea');
  textarea.placeholder = '---\nid: pbc-example\ntitle: My Feature\nstatus: draft\n---\n\n# My Feature\n\n```pbc:actors\n- id: user\n  name: User\n  type: human\n  description: ...\n```';
  let debounceTimer: ReturnType<typeof setTimeout>;
  textarea.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentRaw = textarea.value;
      if (currentRaw.trim()) {
        select.value = '';
        renderDocument(currentRaw, viewer);
      }
    }, 400);
  });
  sidebar.appendChild(textarea);

  // Drop zone
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.textContent = 'Drop .pbc.md file here';
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      textarea.value = text;
      currentRaw = text;
      select.value = '';
      renderDocument(text, viewer);
    };
    reader.readAsText(file);
  });
  sidebar.appendChild(dropZone);

  // Viewer
  const viewer = document.createElement('div');
  viewer.className = 'viewer';
  viewer.innerHTML = '<div class="empty-state">Select an example or paste PBC content to begin.</div>';

  // Click empty space to clear highlight
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) clearHighlight();
  });

  app.appendChild(sidebar);
  app.appendChild(viewer);

  // Auto-load first example
  select.value = EXAMPLES[0].file;
  select.dispatchEvent(new Event('change'));
}

function renderDocument(raw: string, container: HTMLElement) {
  container.innerHTML = '';

  const doc = parseString(raw);
  const results = validate(doc);

  container.appendChild(renderHeader(doc.frontmatter));
  container.appendChild(renderValidationBar(results));

  const panels = [
    renderGlossary(doc.blocks),
    renderActors(doc.blocks),
    renderStates(doc.blocks),
    renderConfig(doc.blocks),
    renderBehaviors(doc.blocks),
    renderRules(doc.blocks),
  ];

  for (const panel of panels) {
    if (panel) container.appendChild(panel);
  }
}

init();
