import { useEffect, useState } from 'react'
import { wagmiConfig } from '@/utils/constants/wagmi'
import { erc20Abi, formatUnits, type Address } from 'viem'
import { ethers } from 'ethers'
import { getBalance, readContract } from '@wagmi/core'
import type { ITokenInfo } from '@/utils/interfaces/token'
export function useUserTokenBalance(
  userAddress?: Address,
  token?: ITokenInfo,
  chainId?: number
) {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      setError(null)
      if (!userAddress || !token || !chainId) {
        setBalance('0')
        return
      }
      setLoading(true)
      try {
        const tokenAddress = token.address
        console.log("🚀 ~ fetchBalance ~ tokenAddress:", tokenAddress)
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
        console.log("🚀 ~ fetchBalance ~ rawBalance:", rawBalance)

          const formatted = formatUnits(rawBalance, token.decimals)
        setBalance(formatted)
      } catch (err) {
        setError(err as Error)
        setBalance('0')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [userAddress, token, chainId])

  return { balance, loading, error }
}
