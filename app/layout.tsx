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
              colorBackground: "#080809",
              colorInput: "#18181c",
              colorForeground: "#f0f0f4",
              colorInputForeground: "#f0f0f4",
              colorPrimary: "#00c8d4",
              colorPrimaryForeground: "#080809",
              colorMutedForeground: "#c0c0cc",
              colorNeutral: "#f0f0f4",
              colorDanger: "#ff4d4f",
              colorSuccess: "#34d399",
              colorBorder: "#2a2a30",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "bg-[#111114] shadow-none border border-[#2a2a30]",
              headerTitle: "text-[#f0f0f4] font-semibold",
              headerSubtitle: "text-[#c0c0cc]",
              formButtonPrimary:
                "!bg-[#00c8d4] hover:!bg-[#00b8c2] !text-[#080809] !font-semibold !rounded-xl !shadow-none !normal-case !py-3 !min-h-[48px] !w-full !text-sm",
              socialButtonsBlockButton:
                "!border !border-[#2a2a30] !bg-[#18181c] hover:!bg-[#1e1e23] !text-[#f0f0f4] !rounded-xl !shadow-none !py-3 !min-h-[48px] !w-full",
              socialButtonsBlockButtonText: "!text-[#f0f0f4] !font-medium !text-sm",
              socialButtonsBlockButtonArrow: "!text-[#808090]",
              formFieldInput:
                "!bg-[#18181c] !border !border-[#2a2a30] !text-[#f0f0f4] !rounded-xl focus:!border-[#00c8d4] !ring-0 !outline-none !py-3 !min-h-[48px] !text-sm !w-full",
              formFieldLabel: "!text-[#c0c0cc] !text-sm !font-medium",
              dividerLine: "bg-[#2a2a30]",
              dividerText: "text-[#808090]",
              footerActionText: "text-[#808090]",
              footerActionLink: "text-[#00c8d4] hover:text-[#00b8c2]",
              identityPreviewText: "text-[#f0f0f4]",
              identityPreviewEditButton: "text-[#00c8d4]",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}