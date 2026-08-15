import React from 'react';

// ── Icons (inline SVG, no dependency) ──────────────────────────────────────

export function IconSearch({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function IconClipboard({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x={9} y={2} width={6} height={4} rx={1} /><path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
    </svg>
  );
}

export function IconCheck({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconDownload({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} y1={15} x2={12} y2={3} />
    </svg>
  );
}

export function IconAlert({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} />
    </svg>
  );
}

export function IconChevronDown({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconX({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconArrowLeft({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="m19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export function IconGrip({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx={9} cy={7} r={1.5} /><circle cx={15} cy={7} r={1.5} />
      <circle cx={9} cy={12} r={1.5} /><circle cx={15} cy={12} r={1.5} />
      <circle cx={9} cy={17} r={1.5} /><circle cx={15} cy={17} r={1.5} />
    </svg>
  );
}

export function IconRefresh({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function IconPlus({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconInfo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10} />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

// ── Toggle Switch ───────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
      <div
        role="switch"
        id={id}
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50
          ${checked ? 'bg-[#3B82F6]' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      {label && (
        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors select-none">
          {label}
        </span>
      )}
    </label>
  );
}

// ── Field wrapper ───────────────────────────────────────────────────────────

export function Field({ label, required, error, hint, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
          {label}
          {required && <span className="text-[#3B82F6] leading-none">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <IconX className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-faint)]">{hint}</p>
      )}
    </div>
  );
}

// ── Section header ──────────────────────────────────────────────────────────

export function SectionHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">{title}</h3>
      {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
    </div>
  );
}

// ── Confidence Badge ────────────────────────────────────────────────────────

export function ConfidenceBadge({ confidence }) {
  const normalized = (confidence || '').toLowerCase();
  if (normalized.includes('high')) return <span className="badge-high">{confidence}</span>;
  if (normalized.includes('probable')) return <span className="badge-probable">{confidence}</span>;
  if (normalized.includes('manual') || normalized.includes('review')) return <span className="badge-review">{confidence}</span>;
  if (normalized.includes('unreliable')) return <span className="badge-unreliable">{confidence}</span>;
  return <span className="badge-probable">{confidence || 'Unknown'}</span>;
}

// ── Copy to Clipboard Button ────────────────────────────────────────────────

export function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`p-1 rounded transition-colors ${
        copied
          ? 'text-[#3B82F6]'
          : 'text-[var(--text-faint)] hover:text-[var(--text-secondary)]'
      }`}
    >
      {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconClipboard />}
    </button>
  );
}

// ── Toast notification ──────────────────────────────────────────────────────

export function Toast({ message, type = 'info', onDismiss }) {
  const iconMap = {
    success: <IconCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
    warning: <IconAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
    error:   <IconX className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
    info:    <IconInfo className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className="toast">
      {iconMap[type] || iconMap.info}
      <p className="flex-1 text-[var(--text-primary)]">{message}</p>
      <button onClick={onDismiss} className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] ml-2 mt-0.5">
        <IconX />
      </button>
    </div>
  );
}

// ── Network error banner ────────────────────────────────────────────────────

export function NetworkErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-sm">
      <IconAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-300 font-medium">Connection error</p>
        <p className="text-[var(--text-secondary)] mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs px-3 py-1.5">
          <IconRefresh className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
