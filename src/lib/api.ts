import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web on same machine uses localhost; physical device needs your PC IP in .env
const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

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
        ? `Cannot reach API at ${API}. Start server: cd server && npm start`
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
  value: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  blocked?: boolean;
  createdAt: string;
};

export type PublicSettings = {
  usdtPrice: number;
  walletAddress: string;
  maintenanceMode: boolean;
  referralReward: number;
  supportPhone: string;
  supportTelegram: string;
  supportWhatsapp: string;
  supportPhoneVisible: boolean;
  supportTelegramVisible: boolean;
  supportWhatsappVisible: boolean;
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
        ? `Cannot reach API at ${API}. Run: cd server && npm start`
        : `Cannot reach API. Set EXPO_PUBLIC_API_URL in jctrade/.env`
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to load settings');
  return data as PublicSettings;
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
