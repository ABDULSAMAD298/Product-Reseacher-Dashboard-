import React, { useState, useEffect, useRef } from 'react';
import CONFIG from '../config.js';
import { getJobStatus } from '../api.js';
import { CopyButton, IconAlert, IconRefresh, IconPlus } from './ui.jsx';

// ── Main Progress View ───────────────────────────────────────────────────────
//
// Polls the job-status endpoint until the job completes, the backend reports
// an error (e.g. "Job not found"), too many requests fail in a row, or the
// overall timeout elapses.

export default function JobProgress({ job, onComplete, onNewJob }) {
  const { job_id } = job;

  const [status, setStatus]     = useState(null);  // Latest status response
  const [error, setError]       = useState(null);  // Terminal error message
  const [attempt, setAttempt]   = useState(0);     // Bumped to restart polling

  // Kept in a ref so a new onComplete identity never restarts polling.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    let timerId   = null;
    let failures  = 0;
    const deadline = Date.now() + CONFIG.JOB_OVERALL_TIMEOUT_MS;

    const fail = (message) => {
      if (!cancelled) setError(message);
    };

    const poll = async () => {
      if (Date.now() > deadline) {
        const minutes = Math.round(CONFIG.JOB_OVERALL_TIMEOUT_MS / 60_000);
        fail(`The research job didn't finish within ${minutes} minutes. It may have stopped unexpectedly.`);
        return;
      }

      try {
        const data = await getJobStatus(job_id);
        if (cancelled) return;

        if (!data || data.success === false) {
          fail("We couldn't find this research job. It may have expired or failed to start.");
          return;
        }

        failures = 0;
        setStatus(data);

        if (data.status === 'completed') {
          onCompleteRef.current(data);
          return;
        }
        if (data.status === 'failed' || data.status === 'error') {
          fail(data.error || data.message || 'The research job failed.');
          return;
        }
      } catch (err) {
        if (cancelled) return;
        // "Job not found" can also arrive as a non-2xx response.
        if (err.body?.success === false) {
          fail("We couldn't find this research job. It may have expired or failed to start.");
          return;
        }
        failures += 1;
        if (failures >= CONFIG.JOB_MAX_POLL_FAILURES) {
          fail(err.message || 'Lost contact with the research service.');
          return;
        }
      }

      timerId = window.setTimeout(poll, CONFIG.JOB_POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [job_id, attempt]);

  const retry = () => {
    setError(null);
    setAttempt((a) => a + 1);
  };

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <IconAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Something went wrong</p>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">{error}</p>
          </div>
        </div>
        <JobIdRow jobId={job_id} />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={retry} className="btn-secondary">
            <IconRefresh className="w-4 h-4" />
            Check again
          </button>
          <button type="button" onClick={onNewJob} className="btn-primary">
            <IconPlus className="w-4 h-4" />
            Start a new research job
          </button>
        </div>
      </div>
    );
  }

  // ── Progress state ──
  const percent     = clampPercent(status?.percent);
  const step        = status?.current_step;
  const totalSteps  = status?.total_steps;
  const description = status?.step_description || 'Starting research…';

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[#2563EB]/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="spinner spinner-sm" />
          <span className="text-xs text-[#2563EB] font-medium uppercase tracking-wider">In progress</span>
        </div>

        <div className="flex items-baseline justify-between gap-4 mt-3">
          <p className="text-sm text-[var(--text-primary)] font-medium" aria-live="polite">
            {description}
          </p>
          <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{percent}%</span>
        </div>

        <div
          className="progress-track mt-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>

        {step != null && totalSteps != null && (
          <p className="text-xs text-[var(--text-muted)] mt-2">Step {step} of {totalSteps}</p>
        )}

        <div className="mt-4 pt-4 border-t border-[rgba(var(--border-rgb),0.12)]">
          <JobIdRow jobId={job_id} />
        </div>
      </div>

      <p className="text-xs text-[var(--text-faint)]">
        Keep this tab open — you'll be taken to the results as soon as the report is ready.
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function JobIdRow({ jobId }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">Job ID</span>
      <span className="font-mono text-xs text-[var(--text-secondary)]">{jobId}</span>
      <CopyButton text={jobId} />
    </div>
  );
}

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
