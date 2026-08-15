import React from 'react';
import { CopyButton, IconDownload, IconAlert } from './ui.jsx';

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

// ── Per-product row (multi-product responses) ───────────────────────────────

function ProductRow({ product }) {
  const isCompleted = (product.status || '').toLowerCase() === 'completed';
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[rgba(var(--border-rgb),0.04)] last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-primary)] font-medium truncate">{product.product_name || 'Untitled product'}</p>
        <span
          className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs font-medium border
            ${isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {product.status || 'unknown'}
        </span>
      </div>
      {product.pdf_url ? (
        <a
          href={product.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(var(--border-rgb),0.12)] text-xs
                     font-medium text-[var(--text-secondary)] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-colors flex-shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5" />
          PDF
        </a>
      ) : (
        <span className="text-xs text-[var(--text-faint)] flex-shrink-0">No PDF</span>
      )}
    </div>
  );
}

// ── Main Results View ────────────────────────────────────────────────────────

export default function Results({ result, onNewJob }) {
  const { job_id, message, sheet_url, pdf_url, products, completed_at } = result;

  const completedAt = completed_at
    ? new Date(completed_at).toLocaleString()
    : new Date().toLocaleString();

  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <div className="space-y-6">

      {/* ── Summary header ── */}
      <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-emerald-500/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Completed</span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Research complete</h2>
        {message && <p className="text-sm text-[var(--text-secondary)] mt-1">{message}</p>}
        <p className="text-xs text-[var(--text-muted)] mt-1">Finished at {completedAt}</p>

        {/* Job ID row */}
        <div className="mt-4 pt-4 border-t border-[rgba(var(--border-rgb),0.06)] flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Job ID</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{job_id}</span>
          <CopyButton text={job_id} />
        </div>
      </div>

      {/* ── Sheet / PDF links ── */}
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">Reports</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={sheet_url}
            label="Open Google Sheet"
            icon={<IconExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#3B82F6] transition-colors" />}
          />
          {!hasProducts && (
            <LinkButton
              href={pdf_url}
              label="Download PDF Report"
              icon={<IconDownload className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#3B82F6] transition-colors" />}
            />
          )}
        </div>
      </div>

      {/* ── Per-product list (multi-product responses) ── */}
      {hasProducts && (
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Products ({products.length})
          </p>
          <div className="rounded-lg border border-[rgba(var(--border-rgb),0.08)] overflow-hidden">
            {products.map((p, i) => (
              <ProductRow key={i} product={p} />
            ))}
          </div>
        </div>
      )}

      {!sheet_url && !pdf_url && !hasProducts && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
          <IconAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[var(--text-secondary)]">No report links were returned for this job.</p>
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
