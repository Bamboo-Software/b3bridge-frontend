import { useState, useEffect } from 'react';
import type { Address } from 'viem';
import { getTokenData } from '@/utils/blockchain/token';

interface TokenData {
  symbol: string;
  decimals: number;
}

export const useTokenData = (tokenAddress: string, chainId: number) => {
  const [tokenData, setTokenData] = useState<TokenData>({ symbol: "Unknown", decimals: 18 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTokenData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getTokenData(chainId, tokenAddress as Address);
        setTokenData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTokenData({ symbol: "Unknown", decimals: 18 }); // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadTokenData();
  }, [tokenAddress, chainId]);

  return { tokenData, loading, error };
};