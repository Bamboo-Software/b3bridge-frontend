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
        <div className="flex w-full">
          <div className={cn(
          "border-gray-200 dark:border-gray-700",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar
            className='bg-white h-full  dark:bg-[#040817] border-1 border-gray-200 dark:border-gray-700' 
            onCollapse={handleSidebarCollapse}
          />
        </div>
        <main className="w-full mx-auto overflow-y-auto pb-4 h-screen  pt-[20px]">
          <Outlet />
        </main>
        </div>
      </div>

  </>


  )
}

export default PageLayout