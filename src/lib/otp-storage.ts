import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSED_KEY = 'jc_otp_dismissed_tx';
const COMPLETED_KEY = 'jc_otp_completed_tx';

async function readSet(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

async function writeSet(key: string, ids: Set<string>) {
  await AsyncStorage.setItem(key, JSON.stringify([...ids]));
}

export async function isOtpBannerHidden(transactionId: string): Promise<boolean> {
  const [dismissed, completed] = await Promise.all([readSet(DISMISSED_KEY), readSet(COMPLETED_KEY)]);
  return dismissed.has(transactionId) || completed.has(transactionId);
}

export async function dismissOtpBanner(transactionId: string) {
  const dismissed = await readSet(DISMISSED_KEY);
  dismissed.add(transactionId);
  await writeSet(DISMISSED_KEY, dismissed);
}

export async function markOtpCompleted(transactionId: string) {
  const completed = await readSet(COMPLETED_KEY);
  completed.add(transactionId);
  await writeSet(COMPLETED_KEY, completed);
  const dismissed = await readSet(DISMISSED_KEY);
  dismissed.add(transactionId);
  await writeSet(DISMISSED_KEY, dismissed);
}
