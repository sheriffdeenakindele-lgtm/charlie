import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d1b1e",
};

export const metadata: Metadata = {
  title: "MyWeatherToday — Real-Time Weather Forecasts",
  description:
    "Live weather forecasts for your current location and cities worldwide. Check temperature, humidity, wind speed, and 7-day outlook.",
  keywords: ["weather", "forecast", "temperature", "real-time weather"],
  authors: [{ name: "MyWeatherToday" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .page-transition { animation: fadeIn 0.3s ease-out; }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a1214] text-white font-[family-name:var(--font-geist-sans)] h-full w-full m-0 p-0`}
      >
        <Providers>
          <div className="page-transition">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
