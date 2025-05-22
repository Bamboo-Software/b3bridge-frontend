"use client";
import AppLayout from "@/components/PublicLayout/Layout";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
const layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <>
        {/* <AuthProvider> */}
        
          {/* <AppLayout> */}

              {children}
              
          {/* </AppLayout> */}
            
        {/* </AuthProvider> */}

    </>
  );

  
};

export default layout;
