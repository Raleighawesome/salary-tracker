import type { Metadata } from 'next';
import './globals.css';
import PasswordProtection from '@/components/PasswordProtection';

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Salary Navigator',
  description: 'Track compensation growth, compare against band targets, and understand your progression over time.'
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <main>
          <PasswordProtection>
            {children}
          </PasswordProtection>
        </main>
      </body>
    </html>
  );
}
