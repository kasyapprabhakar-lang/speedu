import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeedU – Fast & Reliable Courier Service",
  description: "Book courier and parcel delivery across India. Track your shipment in real-time with SpeedU.",
  keywords: "courier, parcel delivery, shipping, India, book courier online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
