import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { Toaster } from "@/components/ui/sonner";
import FloatingChatbot from "@/components/modules/Chatbot/FloatingChatbot";
import SmoothScroll from "@/components/shared/SmoothScroll";

// Same typeface as vibrantbd.com, used for body text and headings
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Browser UI (mobile address bar) in the brand colours
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111111" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Shoe Mart - Your Trusted Online Shoe Store in Bangladesh.",
  description: "Shop the latest shoes, sneakers, sandals & more for men, women and kids, delivered across Bangladesh.",
  icons: {
    icon: "/mainlogo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <QueryProviders>
            <CartProvider>
              <WishlistProvider>
                <SmoothScroll>
                  {children}
                  <FloatingChatbot />
                  <Toaster richColors position="top-right" />
                </SmoothScroll>
              </WishlistProvider>
            </CartProvider>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

