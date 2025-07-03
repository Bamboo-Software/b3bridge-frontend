import type { ReactNode } from 'react';
import { WagmiProvider as WagmiProviderCore,} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/utils/constants/wagmi';

interface WagmiProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderCore config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderCore>
  );
}