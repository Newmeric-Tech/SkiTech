import type { Metadata } from "next";
import { Inter, Merriweather, DM_Sans } from "next/font/google";
import "./globals.css";
import { SharedStoreProvider } from "../store/SharedStore";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-merriweather",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Skitech UI",
  description: "Skitech Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <SharedStoreProvider>
            {children}
          </SharedStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}