import React, { useState } from 'react';
import { CopyButton, IconAlert, IconChevronDown } from './ui.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────

function IconExternalLink({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1={10} y1={14} x2={21} y2={3} />
    </svg>
  );
}

function IconFactory({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2 20h20" />
      <path d="M4 20V10l4 3V10l4 3V10l4 3V4l4 4v12" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

const hasValue = (v) => v !== null && v !== undefined && v !== '';
const joinFields = (fields) => fields.filter(hasValue).join(' · ');

function confidenceTier(score) {
  if (typeof score !== 'number') return 'none';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

const TIER_BADGE_CLASSES = {
  high:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low:    'bg-[rgba(var(--border-rgb),0.06)] text-[var(--text-secondary)] border-[rgba(var(--border-rgb),0.12)]',
  none:   'bg-[rgba(var(--border-rgb),0.06)] text-[var(--text-secondary)] border-[rgba(var(--border-rgb),0.12)]',
};

const TIER_DOT_CLASSES = {
  high:   'bg-emerald-400',
  medium: 'bg-amber-400',
  low:    'bg-[var(--text-faint)]',
  none:   'bg-[var(--text-faint)]',
};

const TIER_FALLBACK_LABEL = {
  high:   'High confidence',
  medium: 'Manual review',
  low:    'Low confidence',
  none:   'Unknown',
};

// ── Link button (opens in a new tab) ─────────────────────────────────────────

function LinkButton({ href, label, icon }) {
  if (!href) {
    return (
      <div className="flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--bg-surface)] border border-[rgba(var(--border-rgb),0.08)] text-sm text-[var(--text-muted)] opacity-50">
        {icon}
        {label}
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-md border transition-all duration-150 text-sm font-medium
                 bg-[var(--bg-surface)] border-[rgba(var(--border-rgb),0.12)] text-[var(--text-primary)] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5
                 hover:text-[#3B82F6] group"
    >
      {icon}
      {label}
    </a>
  );
}

// ── Confidence badge (score-driven, 3 tiers) ─────────────────────────────────

function ConfidenceBadge({ score, label }) {
  const tier = confidenceTier(score);
  const text = joinFields([label || TIER_FALLBACK_LABEL[tier], typeof score === 'number' ? `${score}%` : null]);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${TIER_BADGE_CLASSES[tier]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${TIER_DOT_CLASSES[tier]}`} />
      {text}
    </span>
  );
}

// ── Manufacturer sub-card ─────────────────────────────────────────────────────

function ManufacturerSection({ manufacturer }) {
  const found = manufacturer && Object.values(manufacturer).some(hasValue);

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Manufacturer</p>
      {!found ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <IconFactory className="w-4 h-4 text-[var(--text-faint)] flex-shrink-0" />
          Not found with sufficient evidence.
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <IconFactory className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-primary)] font-medium">{manufacturer.name || 'Unknown manufacturer'}</p>
            {joinFields([manufacturer.website, manufacturer.phone, manufacturer.manufacturing_country]) && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {joinFields([manufacturer.website, manufacturer.phone, manufacturer.manufacturing_country])}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Distributor card + list ──────────────────────────────────────────────────

function DistributorCard({ distributor }) {
  const subline = joinFields([distributor.business_type, distributor.country]);
  const contactLine = joinFields([distributor.website, distributor.phone, distributor.email]);

  return (
    <div className="p-3 rounded-md bg-[var(--bg-surface)] border border-[rgba(var(--border-rgb),0.08)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[var(--text-primary)] font-medium min-w-0 truncate">
          {distributor.company_name || 'Unnamed distributor'}
        </p>
        <ConfidenceBadge score={distributor.confidence_score} label={distributor.verification_status} />
      </div>
      {subline && <p className="text-xs text-[var(--text-muted)] mt-1">{subline}</p>}
      {contactLine && <p className="text-xs text-[var(--text-faint)] mt-0.5 truncate">{contactLine}</p>}
    </div>
  );
}

function DistributorsSection({ distributors }) {
  const list = Array.isArray(distributors) ? distributors : [];

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        Distributors found ({list.length})
      </p>
      {list.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          No distributor candidates found in UAE or the searched fallback countries.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((d, i) => <DistributorCard key={i} distributor={d} />)}
        </div>
      )}
    </div>
  );
}

// ── Per-product row (expandable) ─────────────────────────────────────────────

function ProductRow({ product, alwaysExpanded }) {
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const isOpen = alwaysExpanded || expanded;
  const isCompleted = (product.status || '').toLowerCase() === 'completed';

  return (
    <div className="border-b border-[rgba(var(--border-rgb),0.04)] last:border-0">
      <button
        type="button"
        onClick={() => !alwaysExpanded && setExpanded((e) => !e)}
        className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors
          ${alwaysExpanded ? 'cursor-default' : 'hover:bg-[rgba(var(--border-rgb),0.02)] cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {!alwaysExpanded && (
            <IconChevronDown
              className={`w-3.5 h-3.5 text-[var(--text-faint)] flex-shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
          <p className="text-sm text-[var(--text-primary)] font-medium truncate">{product.product_name || 'Untitled product'}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0
            ${isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {product.status || 'unknown'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[rgba(var(--border-rgb),0.04)]">
          <ManufacturerSection manufacturer={product.manufacturer} />
          <DistributorsSection distributors={product.distributors} />
        </div>
      )}
    </div>
  );
}

// ── Main Results View ────────────────────────────────────────────────────────

export default function Results({ result, onNewJob }) {
  const { job_id, message, sheet_url, products, completed_at } = result;

  const completedAt = completed_at
    ? new Date(completed_at).toLocaleString()
    : new Date().toLocaleString();

  const hasProducts = Array.isArray(products) && products.length > 0;
  const singleProduct = hasProducts && products.length === 1;

  return (
    <div className="space-y-6">

      {/* ── Summary header ── */}
      <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-emerald-500/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Completed</span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Research complete</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {message || 'Your results are ready in the Google Sheet.'}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Finished at {completedAt}</p>

        {/* Job ID row */}
        <div className="mt-4 pt-4 border-t border-[rgba(var(--border-rgb),0.06)] flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Job ID</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{job_id}</span>
          <CopyButton text={job_id} />
        </div>
      </div>

      {/* ── Sheet link ── */}
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">Reports</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={sheet_url}
            label="Open Google Sheet"
            icon={<IconExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#3B82F6] transition-colors" />}
          />
        </div>
      </div>

      {/* ── Per-product list (manufacturer + distributor detail) ── */}
      {hasProducts && (
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Products ({products.length})
          </p>
          <div className="rounded-lg border border-[rgba(var(--border-rgb),0.08)] overflow-hidden">
            {products.map((p, i) => (
              <ProductRow key={i} product={p} alwaysExpanded={singleProduct} />
            ))}
          </div>
        </div>
      )}

      {!sheet_url && !hasProducts && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
          <IconAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[var(--text-secondary)]">No report link was returned for this job.</p>
        </div>
      )}

      {/* ── New job button ── */}
      <div className="pt-2 border-t border-[rgba(var(--border-rgb),0.06)]">
        <button
          id="new-research-btn"
          onClick={onNewJob}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Start a new research job
        </button>
      </div>
    </div>
  );
}
