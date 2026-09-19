import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_API_URL_KEY = '@agrimind_api_url';
const STORAGE_COOKIE_KEY = '@agrimind_session_cookie';

/**
 * Platform and environment-aware default API host:
 * - Web (development): Same-origin proxy path '/agrimind-api' to avoid CORS issues
 * - Android Emulator: 'http://10.0.2.2:3000'
 * - iOS Simulator / default: 'http://localhost:3000'
 * - Physical device: Overridden by EXPO_PUBLIC_API_URL in .env or settings modal
 */
export const getDefaultHost = () => {
  if (Platform.OS === 'web') {
    return '/agrimind-api';
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

export const DEFAULT_API_URL = getDefaultHost();

let currentBaseUrl = DEFAULT_API_URL;
let currentSessionCookie = null;

export const initApiConfig = async () => {
  try {
    if (Platform.OS === 'web') {
      // On web, always stick to the same-origin development proxy to eliminate CORS
      currentBaseUrl = '/agrimind-api';
    } else {
      // On native, check if user previously configured a custom LAN IP
      const savedUrl = await AsyncStorage.getItem(STORAGE_API_URL_KEY);
      if (
        savedUrl &&
        !(Platform.OS === 'android' && savedUrl.includes('localhost'))
      ) {
        currentBaseUrl = savedUrl;
      } else {
        currentBaseUrl = DEFAULT_API_URL;
      }

      // Restore session cookie for native React Native networking
      const savedCookie = await AsyncStorage.getItem(STORAGE_COOKIE_KEY);
      if (savedCookie) {
        currentSessionCookie = savedCookie;
      }
    }
  } catch (err) {
    console.warn('Error reading API storage config:', err);
  }
};

export const getApiBaseUrl = () => {
  return currentBaseUrl;
};

export const setApiBaseUrl = async (newUrl) => {
  if (!newUrl) return;

  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  currentBaseUrl = cleanUrl;

  try {
    await AsyncStorage.setItem(STORAGE_API_URL_KEY, cleanUrl);
  } catch (err) {
    console.warn('Error saving API URL:', err);
  }
};

export const getSessionCookie = () => {
  return currentSessionCookie;
};

export const setSessionCookie = async (cookieStr) => {
  currentSessionCookie = cookieStr;

  try {
    if (cookieStr) {
      await AsyncStorage.setItem(STORAGE_COOKIE_KEY, cookieStr);
    } else {
      await AsyncStorage.removeItem(STORAGE_COOKIE_KEY);
    }
  } catch (err) {
    console.warn('Error persisting session cookie:', err);
  }
};

export const clearSessionCookie = async () => {
  currentSessionCookie = null;

  try {
    await AsyncStorage.removeItem(STORAGE_COOKIE_KEY);
  } catch (err) {
    console.warn('Error clearing session cookie:', err);
  }
};

// Axios instance for /api/* endpoints
const api = axios.create({
  timeout: 45000,
  withCredentials: true,
});

// Axios instance for root routes: /login, /signup, /logout, /profile/update
export const rootApi = axios.create({
  timeout: 45000,
  withCredentials: true,
});

const setupInterceptors = (instance, isApiRoute = false) => {
  instance.interceptors.request.use(
    async (config) => {
      const base = currentBaseUrl.replace(/\/+$/, '');

      config.baseURL = isApiRoute ? `${base}/api` : base;

      // In native platforms, attach manually tracked session cookie.
      // On web, withCredentials: true lets the browser native cookie jar handle connect.sid.
      if (Platform.OS !== 'web' && currentSessionCookie) {
        config.headers = config.headers || {};
        config.headers.Cookie = currentSessionCookie;
      }

      config.headers = config.headers || {};
      config.headers.Accept = 'application/json, text/plain, */*';

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    async (response) => {
      // In native platforms, parse and persist Set-Cookie
      if (Platform.OS !== 'web') {
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
          const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
          for (const cookieItem of cookieArray) {
            if (cookieItem.includes('connect.sid=')) {
              const match = cookieItem.match(/(connect\.sid=[^;]+)/);
              if (match && match[1]) {
                await setSessionCookie(match[1]);
                break;
              }
            }
          }
        }
      }

      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

setupInterceptors(api, true);
setupInterceptors(rootApi, false);

export default api;