import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { Toaster } from "@/components/ui/sonner";
import ChatbotLoader from "@/components/modules/Chatbot/ChatbotLoader";
import SmoothScroll from "@/components/shared/SmoothScroll";
import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/seo";

// Same typeface as vibrantbd.com, used for body text and headings
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  // 300 (light) is never used; each weight is a font file to download
  weight: ["400", "500", "600", "700", "800"],
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

// Site-wide defaults; pages override title / description / canonical.
// metadataBase turns relative canonical and image URLs into full ones.
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getSiteUrl();
  const title = "Shoe Mart - Your Trusted Online Shoe Store in Bangladesh";
  return {
    metadataBase: new URL(siteUrl),
    title,
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
      "shoes Bangladesh",
      "online shoe store",
      "men's shoes",
      "women's shoes",
      "kids shoes",
      "sneakers",
      "sandals",
      "Shoe Mart",
    ],
    icons: {
      icon: "/mainlogo.jpeg",
      apple: "/mainlogo.jpeg",
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_BD",
      title,
      description: DEFAULT_DESCRIPTION,
      url: "/",
      images: [{ url: "/mainlogo.jpeg", alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DEFAULT_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Font variables must sit on <html>: that is where font-sans is applied
      className={`${poppins.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
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
                  <ChatbotLoader />
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

