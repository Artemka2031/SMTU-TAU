import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "СМТУ-ТАУ",
  description: "Лабораторные работы по ТАУ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
