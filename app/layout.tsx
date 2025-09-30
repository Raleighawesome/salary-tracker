import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { PasswordProtection } from '@/components/PasswordProtection';

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: 'Salary Navigator',
  description: 'Track compensation growth, compare against band targets, and understand your progression over time.'
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <PasswordProtection>
          <main>{children}</main>
        </PasswordProtection>
      </body>
    </html>
  );
}
