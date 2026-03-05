
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/components/LanguageContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'ANNA Hub | ج.حي النصر، ش م-4، 31',
  description: 'منصة عصرية لتطوير المجتمع، وإشراك الأعضاء، والحكم الرشيد الشفاف.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning style={{ visibility: 'hidden' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Anti-Flicker Script for Language/Direction/Theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              // Handle Language & Direction
              const lang = localStorage.getItem('language') || 'ar';
              const dir = lang === 'ar' ? 'rtl' : 'ltr';
              document.documentElement.lang = lang;
              document.documentElement.dir = dir;

              // Handle Theme
              const theme = localStorage.getItem('theme');
              const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && supportDarkMode)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }

              document.documentElement.style.visibility = 'visible';
            } catch (e) {
              document.documentElement.style.visibility = 'visible';
            }
          })();
        `}} />
      </head>
      <body className="font-body antialiased transition-colors duration-300">
        <FirebaseClientProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
