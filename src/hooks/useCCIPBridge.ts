import { useState, useEffect } from "react";
import { useWriteContract, useTransaction, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { parseEther, parseUnits, encodeAbiParameters } from "viem";
import { erc20Abi } from "viem";
import { networkConfig, SEPOLIA_BRIDGE_ABI } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";

export function useBridge() {
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nativeLockHash, setNativeLockHash] = useState<`0x${string}` | undefined>();
  const [erc20LockHash, setErc20LockHash] = useState<`0x${string}` | undefined>();
  const { address, isConnected, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId: getCurrentChain()?.id });
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, contractAddress as `0x${string}`],
  });

  const { writeContractAsync: writeNative } = useWriteContract();
  const { writeContractAsync: writeERC20 } = useWriteContract();

  const { isLoading: isNativeLockPending } = useTransaction({ hash: nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: erc20LockHash });

  const handleBridge = async (fromChainId: number, toChainId: number, amount: string, tokenAddress: string, receiver: string) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsBridging(true);
      setError(null);

      // Validate inputs
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Invalid amount");
      }
      if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid receiver address");
      }

      // Verify chain
      const currentChain = getCurrentChain();
      if (currentChain?.id !== fromChainId) {
        await switchChainAsync({ chainId: fromChainId });
      }

      const fromChainConfig = networkConfig.chains.find((c) => c.chain.id === fromChainId);
      const toChainConfig = networkConfig.chains.find((c) => c.chain.id === toChainId);
      if (!fromChainConfig || !toChainConfig) {
        throw new Error("Invalid chain configuration");
      }

      const contractAddress = networkConfig.ccipContracts.sender[fromChainId];
      if (!contractAddress || !contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`Invalid contract address for chain ${fromChainId}`);
      }

      setContractAddress(contractAddress as `0x${string}`);
      setTokenAddress(tokenAddress as `0x${string}`);

      const encodedReceiver = encodeAbiParameters([{ type: "address" }], [receiver as `0x${string}`]);
      console.log("Bridge parameters:", { fromChainId, toChainId, amount, tokenAddress, receiver, contractAddress, encodedReceiver });

      if (!tokenAddress) {
        // Bridge native token
        if (!balance || balance.value < parseEther(amount)) {
          throw new Error("Insufficient balance for native token bridging");
        }
        if (!writeNative) {
          throw new Error("Contract write not ready");
        }

        const result = await writeNative({
          address: contractAddress as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI,
          functionName: "lockNative",
          args: [BigInt(toChainConfig.chain.id), encodedReceiver],
          value: parseEther(amount),
        });
        setNativeLockHash(result);
      } else {
        // Bridge ERC20 token
        const tokenConfig = networkConfig.tokensList.find((t) => Object.values(t.address).includes(tokenAddress as `0x${string}`));
        if (!tokenConfig) {
          throw new Error("Invalid token configuration");
        }
        const decimals = tokenConfig.decimals || 18;
        const amountInUnits = parseUnits(amount, decimals);

        if (!allowance || allowance < amountInUnits) {
          await writeERC20({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [contractAddress as `0x${string}`, amountInUnits],
          });
        }

        if (!writeERC20) {
          throw new Error("Contract write not ready");
        }

        const result = await writeERC20({
          address: contractAddress as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI,
          functionName: "lockERC20",
          args: [tokenAddress as `0x${string}`, amountInUnits, BigInt(toChainConfig.chain.id), encodedReceiver],
        });
        setErc20LockHash(result);
      }
    } catch (err) {
      console.error("Bridge error:", err);
      setError(err instanceof Error ? err.message : "Bridge failed");
    } finally {
      setIsBridging(false);
    }
  };

  return {
    isBridging,
    isNativeLockPending,
    isERC20LockPending,
    error,
    handleBridge,
  };
}