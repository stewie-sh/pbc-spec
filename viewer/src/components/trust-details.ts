import { el } from '../dom.js';

export interface TrustDetails {
  trust: string;
  rejectedReason: string;
  rejectedRef: string;
}

export function readTrust(entry: Record<string, unknown>): TrustDetails {
  return {
    trust: entry.trust == null ? '' : String(entry.trust),
    rejectedReason: typeof entry.rejected_reason === 'string' && entry.rejected_reason.trim()
      ? entry.rejected_reason : 'Rejection reason missing or invalid.',
    rejectedRef: typeof entry.rejected_ref === 'string' ? entry.rejected_ref : '',
  };
}

export function renderTrustBadge(trust: string): HTMLElement | null {
  if (!trust) return null;
  return el('span', { className: `trust-badge${trust === 'rejected' ? ' trust-rejected' : ''}` },
    trust === 'rejected' ? 'Rejected · not active' : `Trust: ${trust}`,
  );
}

export function renderRejection(details: TrustDetails): HTMLElement | null {
  if (details.trust !== 'rejected') return null;
  return el('div', { className: 'rejection-details' },
    el('div', null, el('strong', null, 'Reason: '), details.rejectedReason),
    details.rejectedRef ? el('div', null, el('strong', null, 'Decision: '), details.rejectedRef) : null,
  );
}
