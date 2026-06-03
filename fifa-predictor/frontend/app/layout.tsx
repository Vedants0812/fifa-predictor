import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/app/components/Navbar';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 AI Predictor',
  description: 'ML-powered predictions for all 104 FIFA World Cup 2026 matches',
  openGraph: {
    title: 'FIFA World Cup 2026 AI Predictor',
    description: 'Data-driven match predictions, bracket simulation & team analytics',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
