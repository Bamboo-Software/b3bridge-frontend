import { Outlet } from "react-router-dom";

import { cn } from '@/utils';
import Header from "@/components/layout/Header";
import { useState } from "react";
import { Sidebar } from "@/components/layout/SideBar";

const PageLayout = () => {
const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle sidebar collapse state
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (

  <>
      <div className="flex-1 flex flex-col h-screen overflow-hidden pt-[80px]">
        <Header />

        <div className="flex w-full flex-1 overflow-hidden">
          <div
            className={cn(
              "border-gray-200 dark:border-gray-700",
              isCollapsed ? "w-16" : "w-64"
            )}
          >
            <Sidebar
              className="bg-white h-full dark:bg-[#040817] border-1 border-gray-200 dark:border-gray-700"
              onCollapse={handleSidebarCollapse}
            />
          </div>

          <main className="w-full overflow-y-auto pt-[20px] pb-4">
            <Outlet />
          </main>
        </div>
      </div>

  </>


  )
}

export default PageLayout