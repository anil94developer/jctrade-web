import { Platform } from 'react-native';

type AndroidLogoutBridge = {
  onLogout?: () => void;
};

type ReactNativeWebViewBridge = {
  postMessage?: (message: string) => void;
};

declare global {
  interface Window {
    Android?: AndroidLogoutBridge;
    ReactNativeWebView?: ReactNativeWebViewBridge;
  }
}

/** Notify native host app to clear its own session too. */
export function notifyNativeLogout(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  try {
    window.Android?.onLogout?.();
  } catch {
    // Ignore bridge errors and continue local logout.
  }

  try {
    window.ReactNativeWebView?.postMessage?.(JSON.stringify({ type: 'LOGOUT' }));
  } catch {
    // Ignore bridge errors and continue local logout.
  }
}
