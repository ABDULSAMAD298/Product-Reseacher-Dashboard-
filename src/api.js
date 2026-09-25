import CONFIG from './config.js';

/**
 * Shared fetch wrapper that attaches auth header and handles errors consistently.
 *
 * Uses AbortController (not a fetch `timeout` option — the native fetch API
 * doesn't have one) so requests can be
 * aborted client-side after `timeoutMs`.
 *
 * @param {number} timeoutMs - Request timeout in milliseconds.
 */
async function apiFetch(url, options = {}, timeoutMs = 30_000) {
  const headers = {
    'Content-Type': 'application/json',
    ...(CONFIG.AUTH_HEADER_VALUE
      ? { [CONFIG.AUTH_HEADER_NAME]: CONFIG.AUTH_HEADER_VALUE }
      : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      let body;
      const text = await res.text().catch(() => '');
      try { body = text ? JSON.parse(text) : null; } catch { body = { message: text }; }
      const err = new Error(body?.message || body?.error || `Request failed with HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || 'Success' };
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const minutes = Math.round(timeoutMs / 60_000);
      const timeoutErr = new Error(
        minutes >= 1
          ? `Request timed out — the research service took longer than ${minutes} minutes to respond.`
          : 'Request timed out — the research service took too long to respond.',
      );
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    if (err.message.includes('fetch') || err.name === 'TypeError') {
      const netErr = new Error("Couldn't reach the research service — check your connection and try again.");
      netErr.isNetwork = true;
      throw netErr;
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Submit a new research job.
 *
 * Responds immediately with `{ success, job_id, status, status_check_url }`;
 * poll `getJobStatus(job_id)` for progress.
 *
 * @param {Object} payload - Form fields matching backend contract
 * @returns {Promise<Object>}
 */
export async function startResearchJob(payload) {
  return apiFetch(
    CONFIG.RESEARCH_START_URL,
    { method: 'POST', body: JSON.stringify(payload) },
    CONFIG.RESEARCH_START_TIMEOUT_MS,
  );
}

/**
 * Fetch the current status of a research job.
 *
 * The URL is built from CONFIG (rather than using the absolute
 * `status_check_url` from the start response) so dev requests still go
 * through the /api-proxy and avoid CORS.
 *
 * @param {string} jobId
 * @returns {Promise<Object>} `{ success, status, percent, current_step,
 *   total_steps, step_description, pdf_url }` or `{ success: false, error }`.
 */
export async function getJobStatus(jobId) {
  const url = `${CONFIG.JOB_STATUS_URL}?job_id=${encodeURIComponent(jobId)}`;
  return apiFetch(url, { method: 'GET' }, CONFIG.JOB_STATUS_TIMEOUT_MS);
}
