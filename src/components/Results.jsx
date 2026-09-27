import React from 'react';
import { CopyButton } from './ui.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────

function IconFileText({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1={16} y1={13} x2={8} y2={13} />
      <line x1={16} y1={17} x2={8} y2={17} />
      <line x1={10} y1={9} x2={8} y2={9} />
    </svg>
  );
}

// ── Link button (opens in a new tab) ─────────────────────────────────────────

function LinkButton({ href, label, icon }) {
  if (!href) {
    return (
      <div className="flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--bg-surface)] border border-[rgba(var(--border-rgb),0.15)] text-sm text-[var(--text-muted)] opacity-50">
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
                 bg-[var(--bg-surface)] border-[rgba(var(--border-rgb),0.2)] text-[var(--text-primary)] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5
                 hover:text-[#2563EB] group"
    >
      {icon}
      {label}
    </a>
  );
}

// ── Main Results View ────────────────────────────────────────────────────────

export default function Results({ result, onNewJob }) {
  const { job_id, message, pdf_url, completed_at } = result;

  const completedAt = completed_at
    ? new Date(completed_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="space-y-6">

      {/* ── Summary header ── */}
      <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-emerald-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Completed</span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Research complete</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {message || 'Your report is ready to download.'}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Finished at {completedAt}</p>

        {/* Job ID row */}
        <div className="mt-4 pt-4 border-t border-[rgba(var(--border-rgb),0.12)] flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Job ID</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{job_id}</span>
          <CopyButton text={job_id} />
        </div>
      </div>

      {/* ── Report download ── */}
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">Report</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={pdf_url}
            label="📄 Download Report (PDF)"
            icon={<IconFileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#2563EB] transition-colors" />}
          />
        </div>
        {pdf_url && (
          <p className="text-xs text-[var(--text-faint)] mt-2">
            Includes manufacturer and distributor research for every product, broken down by country.
          </p>
        )}
      </div>

      {/* ── New job button ── */}
      <div className="pt-2 border-t border-[rgba(var(--border-rgb),0.12)]">
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
