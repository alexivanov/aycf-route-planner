import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "AYCF Route Planner", template: "%s | AYCF Route Planner" },
  description: "Plan your route with AYCF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-N9JNZ2C5" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold">
                  AYCF Flight Search
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link href="/" className="hover:text-gray-300">
                  Flight Search
                </Link>
                <Link
                  href="/return-journey-finder"
                  className="hover:text-gray-300"
                >
                  Return Journey Finder
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Analytics />
        <Script id="tomorrow-weather-scripts">
          {`(function(d, s, id) {
          if (d.getElementById(id)) {
          if (window.__TOMORROW__) {
          window.__TOMORROW__.renderWidget();
        }
          return;
        }
          const fjs = d.getElementsByTagName(s)[0];
          const js = d.createElement(s);
          js.id = id;
          js.src = "https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js";

          fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'tomorrow-sdk');`}
        </Script>
      </body>
    </html>
  );
}
