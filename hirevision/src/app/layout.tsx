import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { PageLoader } from '@/components/page-loader';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HireVision - The Next-Gen AI Recruiter',
  description: 'Gemini 3 Powered Recruitment Platform for Modern Teams.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('font-sans antialiased bg-background text-foreground', inter.variable)}>
        <ThemeProvider storageKey="hirevision-theme" defaultTheme="light">
          <FirebaseClientProvider>
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
