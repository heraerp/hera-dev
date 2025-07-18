import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FeedbackProvider } from "@/components/ui/enhanced-feedback";
import { Providers } from './providers';
import ErrorBoundaryProvider from '@/components/error-boundaries/ErrorBoundaryProvider';
import { UniversalThemeWrapper } from '@/components/theme/UniversalThemeWrapper';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HERA Universal - AI-Powered Restaurant Management System",
  description: "World's First Universal Restaurant Management System. AI-powered platform that handles everything - from inventory to staff, menu to compliance. 1,950% ROI with 5-minute setup.",
  keywords: ["restaurant management", "AI inventory", "kitchen display", "order processing", "POS system", "food cost reduction", "HERA Universal"],
  openGraph: {
    title: "HERA Universal - AI Restaurant Management",
    description: "Revolutionary restaurant management with AI-powered inventory, real-time kitchen display, and 30% food cost reduction.",
    type: "website",
  },
};

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter" 
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          jetbrainsMono.variable
        )}
        suppressHydrationWarning={true}
      >
        <ErrorBoundaryProvider>
          <Providers>
            <UniversalThemeWrapper>
              <FeedbackProvider>
                <div id="app-root" className="relative">
                  {children}
                </div>
              </FeedbackProvider>
            </UniversalThemeWrapper>
          </Providers>
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
