import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { EstablishmentProvider } from '@/contexts/EstablishmentContext';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { MobileSearchModalProvider } from '@/components/MobileSearchModalProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { CashRegisterProvider } from '@/contexts/CashRegisterContext';
import ClientLayout from "@/components/ClientLayout";
import GoogleAuthProviderWrapper from '@/components/providers/GoogleAuthProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mis Canchas - Reservá tu cancha favorita",
  description: "La plataforma más fácil para reservar canchas de fútbol 5, paddle, tenis y más. Encontrá el lugar perfecto para tu próximo partido.",
  icons: {
    icon: '/assets/favicon.png',
    shortcut: '/assets/favicon.png',
    apple: '/assets/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <GoogleAuthProviderWrapper>
          <AuthProvider>
            <SuperAdminProvider>
              <EstablishmentProvider>
                <TournamentProvider>
                  <MobileSearchModalProvider>
                    <CashRegisterProvider>
                      <ToastProvider>
                        <ClientLayout>
                          {children}
                        </ClientLayout>
                      </ToastProvider>
                    </CashRegisterProvider>
                  </MobileSearchModalProvider>
                </TournamentProvider>
              </EstablishmentProvider>
            </SuperAdminProvider>
          </AuthProvider>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
