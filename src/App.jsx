import React, { useState, useCallback, useEffect } from 'react';
import Login, { isAuthenticated, clearAuth } from './components/Login.jsx';
import ResearchForm from './components/ResearchForm.jsx';
import JobProgress from './components/JobProgress.jsx';
import Results from './components/Results.jsx';

// ── View IDs ─────────────────────────────────────────────────────────────────
const VIEW = { LOGIN: 'login', FORM: 'form', PROGRESS: 'progress', RESULTS: 'results' };

// ── Logout button ────────────────────────────────────────────────────────────

function LogoutButton({ onLogout }) {
  return (
    <button
      type="button"
      id="logout-btn"
      onClick={onLogout}
      className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
      Logout
    </button>
  );
}

// ── Wordmark / Logo ──────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-[#2563EB]/15 border border-[#2563EB]/25 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
  { id: VIEW.FORM,     label: 'Configure job' },
  { id: VIEW.PROGRESS, label: 'Research'      },
  { id: VIEW.RESULTS,  label: 'Results'       },
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
                  ${done   ? 'bg-[#2563EB] text-white'
                  : active ? 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/50'
                           : 'bg-[rgba(var(--border-rgb),0.05)] text-[var(--text-faint)] border border-[rgba(var(--border-rgb),0.15)]'}`}
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
              <div className={`w-8 sm:w-12 h-px mx-2 transition-colors ${done ? 'bg-[#2563EB]/50' : 'bg-[rgba(var(--border-rgb),0.06)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── View section titles ──────────────────────────────────────────────────────
const VIEW_TITLES = {
  [VIEW.LOGIN]:    { title: 'Sign in', subtitle: 'Log in to start and view research jobs.' },
  [VIEW.FORM]:     { title: 'New research job', subtitle: 'Fill in the fields below to kick off an automated B2B product research run.' },
  [VIEW.PROGRESS]: { title: 'Research in progress', subtitle: 'Your job is running. Progress updates live below.' },
  [VIEW.RESULTS]:  { title: 'Research results', subtitle: 'Your job completed. Download the report below.' },
};

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [view, setView]     = useState(VIEW.FORM);
  const [job, setJob]       = useState(null); // Start response ({ job_id, ... })
  const [result, setResult] = useState(null); // Final "completed" status response

  // Drop the old theme preference; there's only one theme now.
  useEffect(() => {
    try { localStorage.removeItem('prh_theme'); } catch {}
  }, []);

  // Logging out in another tab logs this tab out too.
  useEffect(() => {
    const onStorage = () => setAuthed(isAuthenticated());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogin = useCallback(() => {
    setAuthed(true);
    setView(VIEW.FORM);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthed(false);
    setView(VIEW.FORM);
    setJob(null);
    setResult(null);
  }, []);

  // Form → Progress, as soon as the start call returns a job_id.
  const handleJobStarted = useCallback((data) => {
    setJob(data);
    setView(VIEW.PROGRESS);
  }, []);

  // Progress → Results, once polling reports status "completed".
  const handleJobComplete = useCallback((data) => {
    setResult({ ...data, job_id: data.job_id || job?.job_id });
    setView(VIEW.RESULTS);
  }, [job]);

  // Results → new job
  const handleNewJob = useCallback(() => {
    setView(VIEW.FORM);
    setJob(null);
    setResult(null);
  }, []);

  // Every screen is behind the login gate.
  const currentView = authed ? view : VIEW.LOGIN;
  const { title, subtitle } = VIEW_TITLES[currentView];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[rgba(var(--border-rgb),0.12)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo />
          {authed && (
            <div className="flex items-center gap-4">
              <StepIndicator current={view} />
              <LogoutButton onLogout={handleLogout} />
            </div>
          )}
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
          {currentView === VIEW.LOGIN && (
            <Login onLogin={handleLogin} />
          )}
          {currentView === VIEW.FORM && (
            <ResearchForm onJobStarted={handleJobStarted} />
          )}
          {currentView === VIEW.PROGRESS && job && (
            <JobProgress job={job} onComplete={handleJobComplete} onNewJob={handleNewJob} />
          )}
          {currentView === VIEW.RESULTS && result && (
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
