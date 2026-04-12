import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEOCANNABIS · Grower.ge",
  description:
    "GEOCANNABIS (Grower.ge) — ქართული კანაბის ფორუმი, გროვერების დღიურები და კომუნიტი. ინგლისური და რუსული გვერდებიც.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#08111f] text-slate-100">
        {children}
      </body>
    </html>
  );
}
