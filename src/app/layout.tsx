import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Office Bazzar Admin Portal',
  description: 'Enterprise B2B Product Catalogue Administration',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
