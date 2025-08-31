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

export const metadata = {
  title: "GPX Trail Animator - Animate Your Hiking Trails on Apple Maps",
  description: "Transform static GPX route files into dynamic, customizable animations on interactive Apple Maps. Perfect for hikers, cyclists, and outdoor enthusiasts.",
  keywords: ["GPX", "trail animation", "Apple Maps", "hiking", "cycling", "route visualization", "GPS tracks", "outdoor activities"],
  authors: [{ name: "GPX Trail Animator" }],
  creator: "GPX Trail Animator",
  publisher: "GPX Trail Animator",
  openGraph: {
    title: "GPX Trail Animator - Animate Your Hiking Trails",
    description: "Transform static GPX route files into dynamic, customizable animations on interactive Apple Maps.",
    url: "https://gpx-animate.com", // Replace with your actual URL
    siteName: "GPX Trail Animator",
    images: [
      {
        url: "/og-image.jpg", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "GPX Trail Animator Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GPX Trail Animator - Animate Your Hiking Trails",
    description: "Transform static GPX route files into dynamic, customizable animations on interactive Apple Maps.",
    images: ["/og-image.jpg"], // Same as OG image
    creator: "@yourtwitter", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code", // Replace with actual code
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
