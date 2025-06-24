import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlowPilot",
  description: "FlowPilot - The smart way to manage your company finances and projects.",
  openGraph: {
    title: 'FlowPilot',
    description: 'FlowPilot - The smart way to manage your company finances and projects.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
  <link rel="icon" href="/logo.ico" type="image/x-icon" />
  <meta name="theme-color" content="#2563eb" />
</head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}


