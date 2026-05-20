import { GoogleOAuthProvider } from '@react-oauth/google';
import { Platform } from 'react-native';
import type { ReactNode } from 'react';

import { GOOGLE_CLIENT_ID } from '@/lib/google-auth';

/** Single GoogleOAuthProvider for entire app (avoids double initialize on web) */
export function GoogleProvider({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return children;
  }
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
