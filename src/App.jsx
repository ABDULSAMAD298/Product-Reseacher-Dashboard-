import React, { useState, useCallback, useEffect } from 'react';
import ResearchForm from './components/ResearchForm.jsx';
import Results from './components/Results.jsx';

// ── View IDs ─────────────────────────────────────────────────────────────────
const VIEW = { FORM: 'form', RESULTS: 'results' };

// ── Theme toggle ─────────────────────────────────────────────────────────────

function getInitialTheme() {
  try {
    return localStorage.getItem('prh_theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-[rgba(var(--border-rgb),0.1)]
                 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[rgba(var(--border-rgb),0.2)]
                 transition-colors flex-shrink-0"
    >
      {isLight ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={4} />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}

// ── Wordmark / Logo ──────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-[#3B82F6]/15 border border-[#3B82F6]/25 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx={11} cy={11} r={8}/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M11 8v3l2 2" strokeWidth={1.8}/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">Product Research Hub</p>
        <p className="text-[10px] text-[var(--text-faint)] mt-0.5 leading-none">B2B Intelligence Platform</p>
      </div>
    </div>
  );
}

// ── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { id: VIEW.FORM,    label: 'Configure job' },
  { id: VIEW.RESULTS, label: 'Results'       },
];

function StepIndicator({ current }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                  ${done   ? 'bg-[#3B82F6] text-white'
                  : active ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/50'
                           : 'bg-[rgba(var(--border-rgb),0.05)] text-[var(--text-faint)] border border-[rgba(var(--border-rgb),0.08)]'}`}
              >
                {done ? (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ) : (i + 1)}
              </div>
              <span
                className={`text-xs transition-colors hidden sm:inline
                  ${active ? 'text-[var(--text-primary)] font-medium' : done ? 'text-[var(--text-muted)]' : 'text-[var(--text-faint)]'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-px mx-2 transition-colors ${done ? 'bg-[#3B82F6]/50' : 'bg-[rgba(var(--border-rgb),0.06)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── View section titles ──────────────────────────────────────────────────────
const VIEW_TITLES = {
  [VIEW.FORM]:     { title: 'New research job', subtitle: 'Fill in the fields below to kick off an automated B2B product research run.' },
  [VIEW.RESULTS]:  { title: 'Research results', subtitle: 'Your job completed. Open your sheet or download the reports below.' },
};

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]     = useState(VIEW.FORM);
  const [result, setResult] = useState(null); // Final response from the research webhook
  const [theme, setTheme]   = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('prh_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // Form → Results.
  // The research call is synchronous, so this only fires once the webhook
  // has responded with the final sheet URL — the user never sees the
  // results view before those URLs exist.
  const handleJobComplete = useCallback((data) => {
    setResult(data);
    setView(VIEW.RESULTS);
  }, []);

  // Results → new job
  const handleNewJob = useCallback(() => {
    setView(VIEW.FORM);
    setResult(null);
  }, []);

  const { title, subtitle } = VIEW_TITLES[view];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-[color:var(--bg-app)]/90 backdrop-blur-sm border-b border-[rgba(var(--border-rgb),0.06)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <StepIndicator current={view} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
        </div>

        {/* View content */}
        <div className="card p-6 sm:p-8">
          {view === VIEW.FORM && (
            <ResearchForm onJobStarted={handleJobComplete} />
          )}
          {view === VIEW.RESULTS && result && (
            <Results result={result} onNewJob={handleNewJob} />
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 pb-4 text-center">
          <p className="text-xs text-[var(--text-footer)]">
            Product Research Hub — B2B intelligence platform. All data is sourced via automated research workflows.
          </p>
        </footer>
      </main>
    </div>
  );
}
