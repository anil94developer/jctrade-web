import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { api, type PaginatedResponse, type Transaction } from '@/lib/api';
import { dismissOtpBanner, isOtpBannerHidden, markOtpCompleted } from '@/lib/otp-storage';
import { getSocketUrl } from '@/lib/socket-url';

export type OtpAlert = {
  transactionId: string;
  message: string;
  maskedPhone?: string;
  devOtp?: string;
};

type SocketContextValue = {
  otpAlert: OtpAlert | null;
  dismissOtpAlert: () => Promise<void>;
  clearOtpAlertAfterSuccess: (transactionId: string) => Promise<void>;
  refreshPendingOtpAlert: () => Promise<void>;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

const DEFAULT_OTP_MESSAGE =
  'You received an OTP on your mobile number. Open Sell Orders and enter the OTP.';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const toast = useToast();
  const [otpAlert, setOtpAlert] = useState<OtpAlert | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const showOtpAlertIfAllowed = useCallback(async (payload: OtpAlert) => {
    const hidden = await isOtpBannerHidden(payload.transactionId);
    if (hidden) {
      setOtpAlert(null);
      return;
    }
    setOtpAlert(payload);
  }, []);

  const refreshPendingOtpAlert = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api<PaginatedResponse<Transaction>>('/transactions/mine?page=1&limit=20');
      const pending = res.data.find(
        (t) => t.status === 'pending' && t.otpSent && !t.userSubmittedOtp && !t.blocked
      );
      if (!pending) {
        setOtpAlert(null);
        return;
      }
      const hidden = await isOtpBannerHidden(pending._id);
      if (hidden) {
        setOtpAlert(null);
        return;
      }
      setOtpAlert({
        transactionId: pending._id,
        message: DEFAULT_OTP_MESSAGE,
      });
    } catch {
      /* keep current banner if fetch fails */
    }
  }, [token]);

  const dismissOtpAlert = useCallback(async () => {
    if (otpAlert?.transactionId) {
      await dismissOtpBanner(otpAlert.transactionId);
    }
    setOtpAlert(null);
  }, [otpAlert?.transactionId]);

  const clearOtpAlertAfterSuccess = useCallback(async (transactionId: string) => {
    await markOtpCompleted(transactionId);
    setOtpAlert(null);
  }, []);

  useEffect(() => {
    if (!token) {
      socket?.disconnect();
      setSocket(null);
      setConnected(false);
      setOtpAlert(null);
      return;
    }

    const s = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      setConnected(true);
      refreshPendingOtpAlert().catch(() => {});
    });
    s.on('disconnect', () => setConnected(false));
    s.on('otp:sent', (payload: OtpAlert) => {
      showOtpAlertIfAllowed(payload).then(() => {
        toast.showInfo(payload.message || DEFAULT_OTP_MESSAGE);
      });
    });
    s.on('otp:verified', (payload: { transactionId: string; message?: string }) => {
      markOtpCompleted(payload.transactionId).then(() => setOtpAlert(null));
      toast.showSuccess(payload.message || 'OTP submitted successfully.');
    });
    s.on('transaction:approved', (payload: { message?: string }) => {
      toast.showSuccess(payload.message || 'Your order was approved!');
    });

    setSocket(s);
    refreshPendingOtpAlert().catch(() => {});

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect only when token changes
  }, [token]);

  const value = useMemo(
    () => ({
      otpAlert,
      dismissOtpAlert,
      clearOtpAlertAfterSuccess,
      refreshPendingOtpAlert,
      connected,
    }),
    [otpAlert, dismissOtpAlert, clearOtpAlertAfterSuccess, refreshPendingOtpAlert, connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
