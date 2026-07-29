import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';
import { createSecuritySdk } from '@indwella/api-client';
import { securityTokenStorage } from './tokenStorage';

const FALLBACK_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost';
const baseURL = API_BASE_URL || FALLBACK_API_URL;

let sessionExpiredHandler: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  sessionExpiredHandler = handler;
};

export const securitySdk = createSecuritySdk({
  baseURL,
  storage: securityTokenStorage,
  onSessionExpired: () => sessionExpiredHandler?.(),
});

/** Drop-in replacement for the old `import api from '../../lib/apiClient'` default export. */
export const api = securitySdk.client.axios;

export const securityApi = securitySdk.security;
export const authApi = securitySdk.auth;
