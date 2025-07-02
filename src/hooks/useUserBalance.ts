import { useEffect, useState } from 'react'
import { wagmiConfig } from '@/utils/constants/wagmi'
import { erc20Abi, formatUnits, type Address } from 'viem'
import type { ChainId } from '@/utils/enums/chain'
import { ethers } from 'ethers'
import { getTokenData } from '@/utils/blockchain/token'
import { getBalance, readContract } from '@wagmi/core'
export function useUserTokenBalance(
  userAddress?: Address,
  tokenAddress?: Address,
  chainId?: ChainId,
) {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      setError(null)
   
      if (!userAddress || !tokenAddress || !chainId) {
        setBalance('0')
        return
      }

      setLoading(true)
      try {
        const isNative = tokenAddress === ethers.ZeroAddress

        const rawBalance = isNative
          ? (await getBalance(wagmiConfig, { address: userAddress, chainId })).value
          : await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            chainId,
            args: [userAddress],
          }) as bigint


        const data = await getTokenData(chainId, tokenAddress as Address)

        if (!data || !data.decimals) {
          throw new Error('Failed to fetch token data')
        }

        const formatted = formatUnits(rawBalance, data.decimals)
        setBalance(formatted)
      } catch (err) {
        setError(err as Error)
        setBalance('0')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [userAddress, tokenAddress, chainId])

  return { balance, loading, error }
}
