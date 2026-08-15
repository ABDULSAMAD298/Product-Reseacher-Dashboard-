import CONFIG from './config.js';

/**
 * Shared fetch wrapper that attaches auth header and handles errors consistently.
 *
 * Uses AbortController (not a fetch `timeout` option — the native fetch API
 * doesn't have one) so long-running synchronous webhook calls can still be
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
        `Request timed out — the research service took longer than ${minutes} minutes to respond.`,
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
 * This is a SYNCHRONOUS call: it resolves only once the entire research run
 * has completed, returning the final result directly (no job polling).
 *
 * @param {Object} payload - Form fields matching backend contract
 * @returns {Promise<Object>} Final result — see Results.jsx for the two possible shapes.
 */
export async function startResearchJob(payload) {
  return apiFetch(
    CONFIG.RESEARCH_START_URL,
    { method: 'POST', body: JSON.stringify(payload) },
    CONFIG.RESEARCH_START_TIMEOUT_MS,
  );
}
