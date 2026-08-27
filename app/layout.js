import './globals.css';
import NextAuthProvider from '@/components/NextAuthProvider';
import IdleTimerProvider from '@/components/IdleTimerProvider';

export const metadata = {
  title: 'Alex Bimasakti — Electronic CV & Portfolio',
  description: 'Interactive Electronic CV & Full-Stack Engineer Portfolio built with Next.js and SQLite',
  keywords: ['Software Engineer', 'Full-Stack Developer', 'Next.js', 'CV', 'Resume', 'Portfolio'],
  authors: [{ name: 'Alex Bimasakti' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextAuthProvider>
          <IdleTimerProvider>
            {children}
          </IdleTimerProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
