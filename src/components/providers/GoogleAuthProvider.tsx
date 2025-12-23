'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleAuthProviderWrapperProps {
  children: ReactNode;
}

// Production client ID - configured in Google Cloud Console for miscanchas.com
const DEFAULT_CLIENT_ID = '589503315572-lq8finm3a85k40mfv8ftde82ddhic2rq.apps.googleusercontent.com';

export default function GoogleAuthProviderWrapper({ children }: GoogleAuthProviderWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
