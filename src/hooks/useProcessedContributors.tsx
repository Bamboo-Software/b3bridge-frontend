import { useState, useEffect, useMemo } from 'react';
import { formatUnits, type Address } from 'viem';
import { getTokenData } from '@/utils/blockchain/token';
import type { ContributorRow, PresaleSupportedChain } from '@/utils/interfaces/launchpad';

interface ChainInfo {
  key: string;
  label: string;
  contractAddress: string;
  chainId: number;
  paymentTokenAddress: string;
}

interface ContributorItem {
  wallet: string;
  amount: bigint | number;
}

interface UseProcessedContributorsProps {
  chains: ChainInfo[];
  contributorsByChain: ContributorItem[][];
  presaleChains: PresaleSupportedChain[];
}

export function useProcessedContributors({
  chains,
  contributorsByChain,
  presaleChains
}: UseProcessedContributorsProps) {
  const [processedContributors, setProcessedContributors] = useState<ContributorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create stable dependencies with custom serialization for BigInt
  const chainsKey = useMemo(() => JSON.stringify(chains), [chains]);
  
  const contributorsKey = useMemo(() => {
    return JSON.stringify(contributorsByChain, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
  }, [contributorsByChain]);
  
  const presaleChainsKey = useMemo(() => JSON.stringify(presaleChains), [presaleChains]);

  useEffect(() => {
    if (contributorsByChain.length === 0 || chains.length === 0) {
      setProcessedContributors([]);
      return;
    }

    const processContributors = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get unique tokens
        const tokens = new Map();
        presaleChains.forEach(chain => {
          const key = `${chain.paymentTokenAddress}-${chain.chainId}`;
          if (!tokens.has(key)) {
            tokens.set(key, {
              address: chain.paymentTokenAddress,
              chainId: Number(chain.chainId)
            });
          }
        });
        const uniqueTokens = Array.from(tokens.values());

        // Fetch all token data
        const tokenDecimalsMap = new Map<string, number>();
        
        await Promise.all(
          uniqueTokens.map(async (token) => {
            try {
              const tokenData = await getTokenData(token.chainId, token.address as Address);
              const key = `${token.address}-${token.chainId}`;
              tokenDecimalsMap.set(key, tokenData.decimals || 18);
            } catch (err) {
              console.warn(`Failed to get token data for ${token.address}:`, err);
              const key = `${token.address}-${token.chainId}`;
              tokenDecimalsMap.set(key, 18); // fallback to 18
            }
          })
        );

        // Process contributors with proper decimals
        const map: Record<string, ContributorRow> = {};
        
        chains.forEach((chain, idx) => {
          const contributors = contributorsByChain?.[idx] || [];
          const presaleChain = presaleChains.find(pc => pc.chainId === chain.key);
          
          if (!presaleChain) return;

          // Get decimals for this token
          const tokenKey = `${presaleChain.paymentTokenAddress}-${chain.chainId}`;
          const decimals = tokenDecimalsMap.get(tokenKey) || 18;

          for (const item of contributors) {
            if (!map[item.wallet]) {
              map[item.wallet] = { 
                address: item.wallet,
                chainId: chain.key
              };
              chains.forEach((c) => {
                map[item.wallet][c.key] = 0;
              });
            }

            // Convert amount using proper decimals
            let formattedAmount: number;
            if (typeof item.amount === 'bigint') {
              formattedAmount = Number(formatUnits(item.amount, decimals));
            } else {
              formattedAmount = item.amount / Math.pow(10, decimals);
            }

            map[item.wallet][chain.key] = 
              Number(map[item.wallet][chain.key]) + formattedAmount;
          }
        });

        setProcessedContributors(Object.values(map));
      } catch (err) {
        console.error('Error processing contributors:', err);
        setError(err instanceof Error ? err.message : 'Failed to process contributors');
        setProcessedContributors([]);
      } finally {
        setLoading(false);
      }
    };

    processContributors();
  }, [chainsKey, contributorsKey, presaleChainsKey]);

  return {
    contributors: processedContributors,
    loading,
    error
  };
}