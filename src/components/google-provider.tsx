import { GoogleOAuthProvider } from '@react-oauth/google';
import { Platform } from 'react-native';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { GOOGLE_CLIENT_ID } from '@/lib/google-auth';

/**
 * Web: mount GoogleOAuthProvider only in the browser so static export HTML matches
 * the first client paint (avoids React hydration #418). Also avoids GSI init during SSR.
 */
export function GoogleProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (Platform.OS !== 'web') {
    return children;
  }
  if (!client) {
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
