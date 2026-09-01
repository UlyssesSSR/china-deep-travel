import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | China Deep Travel',
    default: 'China Deep Travel — Real China. Not the Tour-Bus Version.'
  },
  description:
    'Deep travel guides to China written by people who actually live here. Skip the tourist traps, discover the real China.',
  metadataBase: new URL('https://chinadeeptravel.com'),
  openGraph: {
    siteName: 'China Deep Travel',
    locale: 'en_US',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
