'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '@/configs/wagmi';

function WagmiWrapperProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}

export default WagmiWrapperProvider;
