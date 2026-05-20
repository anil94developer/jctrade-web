import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN_KEY = 'userToken';
export const AUTH_USER_KEY = 'userData';

/** Works on web + native (AsyncStorage v3 has removeMany, not multiRemove). */
export async function clearAuthStorage(): Promise<void> {
  const keys = [AUTH_TOKEN_KEY, AUTH_USER_KEY];
  const storage = AsyncStorage as typeof AsyncStorage & {
    removeMany?: (k: string[]) => Promise<void>;
    multiRemove?: (k: string[]) => Promise<void>;
  };
  if (typeof storage.removeMany === 'function') {
    await storage.removeMany(keys);
    return;
  }
  if (typeof storage.multiRemove === 'function') {
    await storage.multiRemove(keys);
    return;
  }
  await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
}
