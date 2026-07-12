import type { Metadata } from "next";
import "./globals.css";
import FloatingContact from "@/components/FloatingContact";

export const metadata: Metadata = {
  title: "SpeedU – Fast & Reliable Courier Service in India",
  description: "SpeedU offers same-day within-city courier delivery in Muzaffarpur, Hyderabad, Chennai, Wayanad, Mysuru and Visakhapatnam. Book online in 2 minutes. 2-Wheeler, Mini Truck & Packers and Movers.",
  keywords: "SpeedU, courier service, same day delivery, within city courier, Muzaffarpur courier, Hyderabad courier, Chennai delivery, packers movers, book courier online India",
  metadataBase: new URL('https://speedu.in'),
  openGraph: {
    title: "SpeedU – Same Day Courier Delivery",
    description: "Fast & reliable within-city courier pickup and delivery. Book in 2 minutes, track in real-time.",
    url: "https://speedu.in",
    siteName: "SpeedU",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/hero-bg.jpg", width: 1200, height: 630, alt: "SpeedU Courier Service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeedU – Same Day Courier Delivery",
    description: "Fast & reliable within-city courier pickup and delivery across India.",
    images: ["/hero-bg.jpg"],
  },
  alternates: { canonical: "https://speedu.in" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <FloatingContact />
      </body>
    </html>
  );
}
