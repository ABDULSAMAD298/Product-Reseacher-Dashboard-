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
  // Endpoint to start a new research job.
  // NOTE: this is a SYNCHRONOUS call — the response only arrives once the
  // entire research run has completed. Product Discovery (~20min) and
  // Manufacturer + Distributor processing (~18-20min) run sequentially,
  // so a full run can take up to ~45min.
  RESEARCH_START_URL:
    import.meta.env.VITE_RESEARCH_START_URL ||
    prefixUrl('/webhook/research/start'),

  // Timeout for the research start call, in ms. Must comfortably cover the
  // longest expected research run (~45min) with headroom.
  RESEARCH_START_TIMEOUT_MS: 3_600_000, // 60 minutes

  // Authentication header name and value sent on every request
  AUTH_HEADER_NAME:
    import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization',

  // Set to your actual shared secret when deploying. Leave empty ('') if n8n webhook has no auth.
  AUTH_HEADER_VALUE:
    import.meta.env.VITE_AUTH_HEADER_VALUE || '',
};

export default CONFIG;
