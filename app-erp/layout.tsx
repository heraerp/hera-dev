import { Inter } from 'next/font/google';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HERA ERP - Universal Business Management Platform',
  description: 'Revolutionary 5-table universal ERP system with AI-native intelligence',
};

export default function ERPRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}