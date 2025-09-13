import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { MobileSearchModalProvider } from '@/components/MobileSearchModalProvider';
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mis Canchas - Reservá tu cancha favorita",
  description: "La plataforma más fácil para reservar canchas de fútbol 5, paddle, tenis y más. Encontrá el lugar perfecto para tu próximo partido.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <MobileSearchModalProvider>
          <AuthProvider>
            <SocialProvider>
              <ClientLayout>{children}</ClientLayout>
            </SocialProvider>
          </AuthProvider>
        </MobileSearchModalProvider>
      </body>
    </html>
  );
}
