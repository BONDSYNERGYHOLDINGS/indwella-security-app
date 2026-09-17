import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';
import { createSecuritySdk } from '@indwella/sdk';
import { securityTokenStorage } from './tokenStorage';

// The backend runs on :8000. The Android emulator reaches the host machine via
// the 10.0.2.2 alias; the iOS simulator shares the host's network stack, so it
// uses localhost. A hardcoded 10.0.2.2 in .env breaks iOS - keep .env unset for
// simulator work, or point it at a LAN IP when testing on a real device.
const FALLBACK_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const baseURL = API_BASE_URL || FALLBACK_API_URL;

let sessionExpiredHandler: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  sessionExpiredHandler = handler;
};

// The hosted backend runs on Render, which spins down when idle and can take
// 30-60s+ to answer the first request of a session. The SDK's 20s default fires
// long before that and surfaces as a bare "Network Error", so it is raised here
// the same way admin-web does (see indwella-admin-web/src/lib/apiClient.ts).
const REQUEST_TIMEOUT_MS = 60000;

export const securitySdk = createSecuritySdk({
  baseURL,
  storage: securityTokenStorage,
  timeoutMs: REQUEST_TIMEOUT_MS,
  onSessionExpired: () => sessionExpiredHandler?.(),
});

/** Drop-in replacement for the old `import api from '../../lib/apiClient'` default export. */
export const api = securitySdk.client.axios;

export const securityApi = securitySdk.security;
export const authApi = securitySdk.auth;
