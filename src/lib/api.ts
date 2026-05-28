import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function getDefaultApiBase() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalHost) return 'http://localhost:4000/api';
    // Hosted web/webview should call the same deployed origin.
    return `${window.location.origin}/api`;
  }
  // Native app should provide EXPO_PUBLIC_API_URL explicitly.
  return 'http://localhost:4000/api';
}

const API = process.env.EXPO_PUBLIC_API_URL || getDefaultApiBase();

function reachabilityHint(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const usingLocalApi = API.includes('localhost') || API.includes('127.0.0.1');
  if (usingLocalApi && host !== 'localhost' && host !== '127.0.0.1') {
    return ` Rebuild the app with EXPO_PUBLIC_API_URL=https://your-api.onrender.com/api (current: ${API}).`;
  }
  return '';
}

async function getToken() {
  return AsyncStorage.getItem('userToken');
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      Platform.OS === 'web'
        ? `Cannot reach API at ${API}. Start server: cd server && npm start.${reachabilityHint()}`
        : `Cannot reach API. Set EXPO_PUBLIC_API_URL in .env to your computer IP`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Request failed');
  return data as T;
}

export type User = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  upiId: string;
  uid: string;
  balance: number;
  avatar?: string;
};

export type Transaction = {
  _id: string;
  transactionHash: string;
  name: string;
  phone?: string;
  value: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  blocked?: boolean;
  otpSent?: boolean;
  otpVerified?: boolean;
  userSubmittedOtp?: string;
  createdAt: string;
};

export type PublicSettings = {
  usdtPrice: number;
  binancePrice: number;
  walletAddress: string;
  maintenanceMode: boolean;
  referralReward: number;
  referralBaseUrl: string;
  sellCashbackPercent: number;
  buyCashbackPercent: number;
  paymentQrVisible: boolean;
  hasPaymentQr: boolean;
  paymentQrImage?: string | null;
  supportPhone: string;
  supportTelegram: string;
  supportWhatsapp: string;
  supportPhoneVisible: boolean;
  supportTelegramVisible: boolean;
  supportWhatsappVisible: boolean;
};

export type UserStats = {
  inTransaction: number;
  success: number;
  inTransactionAmount?: number;
  successAmount?: number;
};

export type HomeBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  bgColor?: string;
  sortOrder?: number;
};

export type UserEarnings = {
  todayInTransactionAmount: number;
  todaySuccessAmount: number;
  inTransactionAmount: number;
  successAmount: number;
};

export type ReferralMe = {
  referralCode: string;
  referralLink: string;
  referralReward: number;
  sellCashbackPercent: number;
  buyCashbackPercent: number;
  totalTeamRebates: number;
  todayTeamRebates: number;
  teamCount: number;
  team: {
    _id: string;
    name: string;
    email: string;
    uid: string;
    joinedAt: string;
    rewarded: boolean;
  }[];
};

/** Public settings — no auth required */
export async function getPublicSettings(): Promise<PublicSettings> {
  let res: Response;
  try {
    res = await fetch(`${API}/settings/public`, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error(
      Platform.OS === 'web'
        ? `Cannot reach API at ${API}. Run: cd server && npm start.${reachabilityHint()}`
        : `Cannot reach API. Set EXPO_PUBLIC_API_URL in jctrade/.env`
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to load settings');
  return data as PublicSettings;
}

export async function getHomeBanners(): Promise<HomeBanner[]> {
  try {
    const res = await fetch(`${API}/banners/public`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 404) return [];
    const data = await res.json().catch(() => []);
    if (!res.ok) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getPaymentQr(): Promise<{ image: string | null }> {
  const res = await fetch(`${API}/settings/public/payment-qr`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to load QR');
  return data as { image: string | null };
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type WalletEntry = {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  balance: number;
  title: string;
  createdAt: string;
};
