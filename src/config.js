/**
 * API Configuration
 * Target domain: https://iba.localhub.ae
 *
 * In local dev mode, we route through '/api-proxy' to avoid CORS issues on localhost.
 * In production builds, it directly connects to https://iba.localhub.ae
 */

const BASE_DOMAIN = 'https://iba.localhub.ae';
const IS_DEV = import.meta.env.DEV;

// Prefix with /api-proxy in dev mode, or direct domain in production
const prefixUrl = (path) => IS_DEV ? `/api-proxy${path}` : `${BASE_DOMAIN}${path}`;

export const CONFIG = {
  // Endpoint to start a new research job. Responds immediately with a
  // job_id; progress is then read by polling JOB_STATUS_URL.
  RESEARCH_START_URL:
    import.meta.env.VITE_RESEARCH_START_URL ||
    prefixUrl('/webhook/research/start'),

  // Timeout for the start call itself, in ms (it no longer waits for the run).
  RESEARCH_START_TIMEOUT_MS: 60_000,

  // Endpoint polled for job progress: GET ?job_id=<job_id>
  JOB_STATUS_URL:
    import.meta.env.VITE_JOB_STATUS_URL ||
    prefixUrl('/webhook/job-status'),

  // How often to poll the status endpoint, in ms.
  JOB_POLL_INTERVAL_MS: 2_500,

  // Timeout for a single status request, in ms.
  JOB_STATUS_TIMEOUT_MS: 20_000,

  // Give up if the job hasn't completed within this window, in ms.
  JOB_OVERALL_TIMEOUT_MS: 15 * 60_000, // 15 minutes

  // Consecutive failed status requests tolerated before showing an error.
  JOB_MAX_POLL_FAILURES: 5,

  // Authentication header name and value sent on every request
  AUTH_HEADER_NAME:
    import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization',

  // Set to your actual shared secret when deploying. Leave empty ('') if n8n webhook has no auth.
  AUTH_HEADER_VALUE:
    import.meta.env.VITE_AUTH_HEADER_VALUE || '',
};

export default CONFIG;
