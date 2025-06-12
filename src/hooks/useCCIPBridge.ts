import { useState, useEffect } from "react";
import {
  useWriteContract,
  useTransaction,
  useSwitchChain,
  useBalance,
  useReadContract,
  useWalletClient,
} from "wagmi";
import { parseEther, parseUnits, encodeAbiParameters, formatUnits } from "viem";
import { erc20Abi } from "viem";
import { getAddress } from "ethers";
import { waitForTransactionReceipt } from "viem/actions";
import { seiTestnet, sepolia } from "wagmi/chains";
import { readContract } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { networkConfig, SEI_BRIDGE_ABI, SEPOLIA_BRIDGE_ABI, Token } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";
import { getBridgeAddress } from "@/utils";
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

interface BridgeOptions {
  isOFT?: boolean;
}

interface BridgeState {
  isBridging: boolean;
  error: string | null;
  nativeLockHash?: `0x${string}`;
  erc20LockHash?: `0x${string}`;
  burnHash?: `0x${string}`;
}
export const getWrappedOriginAddress = (symbol: string, chainId: number): string | undefined => {
    const wrappedToken = networkConfig.tokensList.find((t) => t.symbol === symbol);
    if (!wrappedToken || !("wrappedFrom" in wrappedToken)) return undefined;
    const originToken = networkConfig.tokensList.find((t) => t.symbol === (wrappedToken as any).wrappedFrom);
    return originToken?.address?.[chainId];
  };
export function useCCIPBridge() {
  const [state, setState] = useState<BridgeState>({
    isBridging: false,
    error: null,
  });
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [selectedTokenConfig, setSelectedTokenConfig] = useState<Token | undefined>();
  const [fromChainId, setFromChainId] = useState<number | undefined>();

  const { wallets, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isNativeLockPending } = useTransaction({ hash: state.nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: state.erc20LockHash });

  const smETH = getBridgeAddress("ethereum");
  const smSEI = getBridgeAddress("sei");
  const address = fromChainId ? wallets[fromChainId]?.address : undefined;

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromChainId,
    token: selectedTokenConfig?.address[fromChainId!] as `0x${string}` | undefined,
  });

  const { data: allowance } = useReadContract(
    tokenAddress && contractAddress
      ? {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [smETH as `0x${string}`, smSEI as `0x${string}`],
        }
      : undefined
  );

  const { data: routerAddress } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI.abi,
    functionName: "getRouter",
  });

  const { data: isPaused } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI.abi,
    functionName: "paused",
  });

  const validateInputs = (
    amount: string,
    receiver: string,
    fromChainId: number,
    toChainId: number
  ): void => {
    if (!wallets[fromChainId]) throw new Error("Please connect wallet");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Invalid amount");
    }
    if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid receiver address");
    }
    if (!smETH || !getAddress(smETH)) throw new Error(`Invalid sender contract address for chain ${fromChainId}`);
    if (!smSEI || (toChainId !== seiTestnet.id && !getAddress(smSEI))) {
      throw new Error(`Invalid receiver contract address for chain ${toChainId}`);
    }
  };

  const ensureCorrectChain = async (fromChainId: number): Promise<void> => {
    const currentChain = getCurrentChain(fromChainId);
    if (currentChain?.id !== fromChainId) {
      await switchChainAsync({ chainId: fromChainId });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refetchBalance();
    }
  };

  const getTokenConfig = (tokenAddress: string | undefined): Token | undefined => {
    return tokenAddress
      ? networkConfig.tokensList.find((t) => Object.values(t.address).includes(tokenAddress as `0x${string}`))
      : networkConfig.tokensList.find((t) => t.symbol === "ETH");
  };

  const encodeAddresses = (toChainId: number, smSEI: string, receiver: string) => {
    if (toChainId === seiTestnet.id) {
      const seiAddressBytes = Buffer.from(smSEI.replace(/^0x/, ""), "hex");
      const receiverBytes = Buffer.from(receiver.replace(/^0x/, ""), "hex");
      return {
        encodedDestAddress: encodeAbiParameters([{ type: "bytes" }], [`0x${seiAddressBytes.toString("hex")}`]),
        encodedReceiverAddress: encodeAbiParameters([{ type: "bytes" }], [`0x${receiverBytes.toString("hex")}`]),
      };
    }
    return {
      encodedDestAddress: encodeAbiParameters([{ type: "address" }], [smSEI as `0x${string}`]),
      encodedReceiverAddress: encodeAbiParameters([{ type: "address" }], [receiver as `0x${string}`]),
    };
  };

  const isBurnUnlockOperation = (
    fromChainId: number,
    toChainId: number,
    toChainSelector: string,
    tokenAddress: string | undefined
  ): boolean => {
    const tokenConfig = getTokenConfig(tokenAddress);
    return toChainId === sepolia.id && toChainSelector === networkConfig.chainSelectors[sepolia.id];
  };

  // const getWrappedOriginAddress = (symbol: string, chainId: number): string | undefined => {
  //   const wrappedToken = networkConfig.tokensList.find((t) => t.symbol === symbol);
  //   if (!wrappedToken || !("wrappedFrom" in wrappedToken)) return undefined;
  //   const originToken = networkConfig.tokensList.find((t) => t.symbol === (wrappedToken as any).wrappedFrom);
  //   return originToken?.address?.[chainId];
  // };

  const approveToken = async (
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amountInUnits: bigint,
    decimals: number
  ): Promise<void> => {
    if (!allowance || allowance < amountInUnits) {
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amountInUnits],
      });
      await waitForTransactionReceipt(walletClient!, { hash: approveTx });
    }
  };

  const handleBridge = async (
    fromChainId: number,
    toChainId: number,
    amount: string,
    balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
    tokenAddress: string | undefined,
    receiver: string,
    toChainSelector: string,
    options: BridgeOptions = {}
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isBridging: true, error: null }));
      setFromChainId(fromChainId);
      setContractAddress(smETH as `0x${string}`);
      setTokenAddress(tokenAddress as `0x${string}`);

      validateInputs(amount, receiver, fromChainId, toChainId);
      await ensureCorrectChain(fromChainId);

      const tokenConfig = getTokenConfig(tokenAddress);
      if (!tokenConfig && tokenAddress) throw new Error("Invalid token configuration");
      setSelectedTokenConfig(tokenConfig);

      const { encodedDestAddress, encodedReceiverAddress } = encodeAddresses(toChainId, smSEI!, receiver);
      const isBurnUnlock = isBurnUnlockOperation(fromChainId, toChainId, toChainSelector, tokenAddress);

      if (isBurnUnlock) {
        await handleBurnUnlock(amount, balance, tokenConfig, toChainSelector, encodedReceiverAddress);
      } else {
        await handleLockMint(
          amount,
          balance,
          tokenConfig,
          tokenAddress,
          toChainSelector,
          receiver
        );
      }
    } catch (err) {
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : "Bridge failed" }));
    } finally {
      setState((prev) => ({ ...prev, isBridging: false }));
    }
  };

  const handleBurnUnlock = async (
    amount: string,
    balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
    tokenConfig: Token | undefined,
    toChainSelector: string,
    encodedReceiverAddress: string
  ): Promise<void> => {
    const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
    if (!balance || balance.value < amountInUnits) {
      throw new Error(`Insufficient ${tokenConfig?.symbol} balance. Required: ${amount} ${tokenConfig?.symbol}`);
    }
    if (!writeContractAsync) throw new Error("Contract write not available");

    const tokenAddressSource = getWrappedOriginAddress(balance.symbol, sepolia.id);
    const tokenId = await readContract(config, {
      address: smETH as `0x${string}`,
      abi: SEPOLIA_BRIDGE_ABI.abi,
      functionName: "tokenAddressToId",
      args: [tokenAddressSource as `0x${string}`],
      chainId: sepolia.id,
    });

    await approveToken(tokenAddress!, smSEI as `0x${string}`, amountInUnits, tokenConfig?.decimals || 18);

    
    const result = await writeContractAsync({
      address: smSEI as `0x${string}`,
      abi: SEI_BRIDGE_ABI.abi,
      functionName: "burnTokenCCIP",
      args: [tokenId, amountInUnits],
      value: parseUnits("600000000", 9),
    });
    setState((prev) => ({ ...prev, burnHash: result }));
  };

  const handleLockMint = async (
    amount: string,
    balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
    tokenConfig: Token | undefined,
    tokenAddress: string | undefined,
    toChainSelector: string,
    receiver: string
  ): Promise<void> => {
    if (!writeContractAsync) throw new Error("Contract write not available");

    if (!tokenAddress) {
      const amountInWei = parseEther(amount);
      if (!balance || balance.value < amountInWei) {
        throw new Error(`Insufficient ETH balance. Required: ${formatUnits(amountInWei, 18)} ETH`);
      }
      console.log(`🚀 ~ useCCIPBridge ~ {
        address: smETH as,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "lockTokenVL",
        args: [BigInt(toChainSelector), encodedDestAddress, encodedReceiverAddress, amountInWei],
        value: amountInWei,
      }:`, {
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "lockTokenVL",
        args: [smSEI, receiver],
        value: amountInWei,
      })
      const result = await writeContractAsync({
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "lockTokenVL",
        args: [smSEI, receiver],
        value: amountInWei,
      });
      setState((prev) => ({ ...prev, nativeLockHash: result }));
    } else {
      const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
      if (!balance || balance.value < amountInUnits) {
        throw new Error(`Insufficient ${tokenConfig?.symbol} balance. Required: ${amount} ${tokenConfig?.symbol}`);
      }
      await approveToken(tokenAddress as `0x${string}`, smETH as `0x${string}`, amountInUnits, tokenConfig?.decimals || 18);
      const result = await writeContractAsync({
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "lockTokenCCIP",
        args: [tokenAddress as `0x${string}`, BigInt(toChainSelector), smSEI, receiver, amountInUnits, 0],
        value: parseEther("0.01"),
      });
      setState((prev) => ({ ...prev, erc20LockHash: result }));
    }
  };

  return {
    isBridging: state.isBridging,
    isNativeLockPending,
    isERC20LockPending,
    state,
    error: state.error,
    handleBridge,
    routerAddress,
    isPaused,
    balance,
    refetchBalance,
  };
}