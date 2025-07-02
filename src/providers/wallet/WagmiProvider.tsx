import type { ReactNode } from 'react';
import { WagmiProvider as WagmiProviderCore, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { mainnet, sepolia } from '@wagmi/core/chains'

interface WagmiProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
  ],
});

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderCore config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderCore>
  );
}