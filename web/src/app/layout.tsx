import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthBootstrap } from '@/components/auth/auth-bootstrap';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'DurmusBaba — HVAC Marktplatz',
  description: 'Kompressoren, Kältetechnik und Zubehör für Profis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        <QueryProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
        </QueryProvider>
      </body>
    </html>
  );
}
