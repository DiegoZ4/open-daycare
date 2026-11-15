import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Sidebar } from "@/app/components/sidebar";
import { TopBar } from "@/app/components/top-bar";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDayCare",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col bg-[#F6ECDF] lg:flex-row">
          <Sidebar />
          <TopBar />
          <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
