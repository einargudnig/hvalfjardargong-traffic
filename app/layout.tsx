import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tunnel Traffic App',
  description: 'Crowdsourced tunnel traffic reporting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <main className="max-w-md mx-auto bg-white min-h-screen shadow-md">
          {children}
        </main>
      </body>
    </html>
  );
}
