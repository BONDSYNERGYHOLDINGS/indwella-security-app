import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenStorage } from '@indwella/api-client';

const ACCESS_KEY = 'security_token';
const REFRESH_KEY = 'security_refresh_token';

export const securityTokenStorage: TokenStorage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async setTokens({ accessToken, refreshToken }) {
    await AsyncStorage.multiSet([
      [ACCESS_KEY, accessToken],
      [REFRESH_KEY, refreshToken],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};
