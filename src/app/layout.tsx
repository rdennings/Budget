import './globals.css';
import { Inter } from 'next/font/google';
import ClientProvider from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Budget Tracker',
  description: 'Manage your personal finances with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
