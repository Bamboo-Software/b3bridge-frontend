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
  <div className={cn(
      "flex h-screen",
      "bg-white dark:bg-[#040817]",
      "text-gray-900 dark:text-gray-100"
    )}>
      {/* Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300 h-full",
        "border-gray-200 dark:border-gray-700",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <Sidebar 
          className='bg-white h-full dark:bg-[#040817] border-1 border-gray-200 dark:border-gray-700' 
          onCollapse={handleSidebarCollapse}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 mx-4 overflow-y-auto pb-4 h-screen pt-[80px]">
          <Outlet />
        </main>
      </div>
    </div>

// </div>
  )
}

export default PageLayout