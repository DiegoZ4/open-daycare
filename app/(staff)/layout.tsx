import type { ReactNode } from "react";
import { Sidebar } from "@/app/components/sidebar";
import { TopBar } from "@/app/components/top-bar";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6ECDF] lg:flex-row">
      <Sidebar />
      <TopBar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
