import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import React from "react";

const RootDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen">
      {/* Dashboard Sidebar */}
      <DashboardSidebar />

      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* DashboardNavbar - shrinks to its natural height */}
        <div className="flex-none">
          <DashboardNavbar />
        </div>
        {/* Dashboard Content - takes remaining height and scrolls */}
        <main data-lenis-prevent className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>


  );
};

export default RootDashboardLayout;
