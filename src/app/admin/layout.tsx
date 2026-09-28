import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { BottomNav } from "@/components/admin/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navigation */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none pb-20 md:pb-0">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
