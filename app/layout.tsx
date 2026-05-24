import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "AI-powered system design workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            variables: {
              colorBackground: "var(--bg-base)",
              colorInput: "var(--bg-elevated)",
              colorForeground: "var(--text-primary)",
              colorInputForeground: "var(--text-primary)",
              colorPrimary: "var(--accent-primary)",
              colorPrimaryForeground: "var(--bg-base)",
              colorMutedForeground: "var(--text-secondary)",
              colorNeutral: "var(--text-primary)",
              colorDanger: "var(--state-error)",
              colorSuccess: "var(--state-success)",
              colorBorder: "var(--border-default)",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}