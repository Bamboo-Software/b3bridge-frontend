"use client";
import Header from "@/components/PublicLayout/Header";
import AppLayout from "@/components/PublicLayout/Layout";
import { config } from "@/configs/wagmi";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { WagmiProvider } from "wagmi";
const layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <>
        {/* <AuthProvider> */}
        
          {/* <AppLayout> */}
      <WagmiProvider config={config}>
        
              <AppLayout>
            <Header/>
              {children}
          </AppLayout>

   </WagmiProvider>

              
          {/* </AppLayout> */}
            
        {/* </AuthProvider> */}

    </>
  );

  
};

export default layout;
