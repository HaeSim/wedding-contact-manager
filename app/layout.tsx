import type React from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { ThemeProvider } from '@/components/theme-provider';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute='class' defaultTheme='light'>
          <div className='flex flex-col h-[100dvh]'>
            <main className='flex-1 overflow-hidden mb-14'>{children}</main>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  generator: 'v0.dev',
};
