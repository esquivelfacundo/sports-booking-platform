'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleAuthProviderWrapperProps {
  children: ReactNode;
}

// Default client ID for development - will be overridden by env var in production
const DEFAULT_CLIENT_ID = '589503315572-k3fc93pbbljf9h616p62111f6bnq9iei.apps.googleusercontent.com';

export default function GoogleAuthProviderWrapper({ children }: GoogleAuthProviderWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
