import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "나만의 가계부",
  description: "개인 재무 관리를 위한 스마트 가계부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <NextTopLoader
          color="#721FE5"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #721FE5,0 0 5px #721FE5"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
