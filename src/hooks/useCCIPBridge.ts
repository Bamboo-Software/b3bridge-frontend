import { useState, useEffect } from "react";
import {
  useWriteContract,
  useTransaction,
  useSwitchChain,
  useBalance,
  useReadContract,
  useWalletClient,
} from "wagmi";
import {  parseUnits, formatUnits } from "viem";
import { getAddress } from "ethers";
import {  waitForTransactionReceipt } from "viem/actions";
import { readContract } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { networkConfig, SEI_BRIDGE_ABI, ETH_BRIDGE_ABI, ethChain, Token, seiChain } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";
import { getBridgeAddress } from "@/utils";
import { tokenAddressNativeToken } from "@/constants";
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


interface BridgeState {
  isBridging: boolean;
  error: string | null;
  nativeLockHash?: `0x${string}`;
  erc20LockHash?: `0x${string}`;
  burnWrappedHash?: `0x${string}`;
  burnHash?: `0x${string}`;
}
type BridgeOperation = "lock-mint" | "burn-unlock" | "wrapped-burn-unlock" | "unknown";
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
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [selectedTokenConfig, setSelectedTokenConfig] = useState<Token | undefined>();
  const [fromChainId, setFromChainId] = useState<number | undefined>();
  const { wallet, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isNativeLockPending } = useTransaction({ hash: state.nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: state.erc20LockHash });

  const smETH = getBridgeAddress("ethereum");
  const smSEI = getBridgeAddress("sei");
  const address = fromChainId ? wallet?.address : undefined;

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromChainId,
    token: selectedTokenConfig?.address[fromChainId!] as `0x${string}` | undefined,
  });


  const { data: routerAddress } = useReadContract({
    address: contractAddress,
    abi: ETH_BRIDGE_ABI.abi,
    functionName: "getRouter",
  });

  const { data: isPaused } = useReadContract({
    address: contractAddress,
    abi: ETH_BRIDGE_ABI.abi,
    functionName: "paused",
  });
  const validateInputs = (
    amount: string,
    receiver: string,
    fromChainId: number,
    toChainId: number
  ): void => {
    if (!wallet) throw new Error("Please connect wallet");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Invalid amount");
    }
    if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid receiver address");
    }
    if (!smETH || !getAddress(smETH)) throw new Error(`Invalid sender contract address for chain ${fromChainId}`);
    if (!smSEI || (toChainId !== seiChain.id && !getAddress(smSEI))) {
      throw new Error(`Invalid receiver contract address for chain ${toChainId}`);
    }
  };
const getBridgeOperationType = (
  fromChainId: number,
  toChainId: number,
  toChainSelector: string,
  tokenAddress: string | undefined
): BridgeOperation => {
  const token = getTokenConfig(tokenAddress);

  const type = getTokenType(token);
  const isSepolia = toChainId === ethChain.id &&
  toChainSelector === networkConfig.chainSelectors[ethChain.id];

  if (type === "wrapped-erc20" && isSepolia) return "burn-unlock";
  if (type === "wrapped-native" && isSepolia) return "wrapped-burn-unlock";
  if (type === "native") return "lock-mint";

  return "lock-mint";
};
function getTokenType(token?: Token): "native" | "erc20" | "wrapped-native" | "wrapped-erc20" | undefined {
  if (!token) return undefined;
  if (token.tags?.includes("native")) return "native";
  if (token.wrappedFrom) {
    const original = networkConfig.tokensList.find((t) => t.symbol === token.wrappedFrom);
    if (original?.tags?.includes("native")) return "wrapped-native";
    else return "wrapped-erc20";
  }
  return "erc20";
}
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
    ? networkConfig.tokensList.find((t) =>
        Object.values(t.address).some((addr) => addr?.toLowerCase() === tokenAddress.toLowerCase())
      )
    : networkConfig.tokensList.find((t) => t.symbol === "ETH");
};


  const approveToken = async (
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  amountRaw: string,
  decimals: number,
  owner: `0x${string}`,
  walletClient?: any,
  force: boolean = true
): Promise<void> => {
    try {
     setState((prev) => ({ ...prev, isBridging: true, error: null }));
    const amountInUnits = parseUnits(amountRaw, decimals);
    const currentAllowance: bigint = await readContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    }) as bigint;

    if (force || currentAllowance < amountInUnits) {
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amountInUnits],
      });
      await waitForTransactionReceipt(walletClient, { hash: approveTx });
       setState((prev) => ({ ...prev, isBridging: false, error: null }));
    } else {
    }
    } catch (err: any) {
      setState({ isBridging: false, error: err.message || "Unknown error" });
    if (err.code === 4001 || err.message?.toLowerCase().includes("user rejected")) {
      throw new Error("Transaction rejected by user");
    }
    throw err;
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
  ccipFee: bigint,
  options: { isOFT: boolean }
): Promise<void> => {
  try {
    setState((prev) => ({ ...prev, isBridging: true, error: null }));
    setFromChainId(fromChainId);
    setContractAddress(smETH as `0x${string}`);

    validateInputs(amount, receiver, fromChainId, toChainId);
    await ensureCorrectChain(fromChainId);

    const tokenConfig = getTokenConfig(tokenAddress);
    if (!tokenConfig && tokenAddress) throw new Error("Invalid token configuration");
    setSelectedTokenConfig(tokenConfig);

    const opType = getBridgeOperationType(fromChainId, toChainId, toChainSelector, tokenAddress);

    const isBurnUnlock = opType === "burn-unlock";
    const isWrappedToken = opType === "wrapped-burn-unlock";
 

    if (isBurnUnlock) {
      await handleBurnUnlock(amount, balance, tokenConfig, tokenAddress, ccipFee);
    } else if (isWrappedToken) {
      await handleBurnWrappedToken(amount, receiver, balance, tokenConfig, tokenAddress);
    } else {
      await handleLockMint(amount, balance, tokenConfig, tokenAddress, toChainSelector, receiver, ccipFee);
    }
    setState((prev) => ({ ...prev, isBridging: false, error: null }));
  } catch (err) {
    console.error("❌ ~ handleBridge error:", err);
    setState((prev) => ({
      ...prev,
      error: err instanceof Error ? err.message : "Bridge failed",
      isBridging: false,
      isNativeLockPending: false,
      isERC20LockPending: false,
    }));
    throw err;
  }
};

const handleBurnUnlock = async (
  amount: string,
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
  tokenConfig: Token | undefined,
  tokenAddress: string | undefined,
  ccipFee: bigint,
): Promise<void> => {
  try {
     setState((prev) => ({ ...prev, isBridging: true, error: null }));
    const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
    if (!balance || balance.value < amountInUnits) {
      throw new Error(`Insufficient ${tokenConfig?.symbol} balance. Required: ${amount}`);
    }

    const tokenAddressSource = getWrappedOriginAddress(balance.symbol, ethChain.id);

    const tokenId = await readContract(config, {
      address: smETH as `0x${string}`,
      abi: ETH_BRIDGE_ABI.abi,
      functionName: "tokenAddressToId",
      args: [tokenAddressSource as `0x${string}`],
      chainId: ethChain.id,
    });

    await approveToken(tokenAddress as `0x${string}`, smSEI as `0x${string}`, amount,tokenConfig?.decimals ?? 18,wallet?.address as `0x${string}`,walletClient);
    const result = await writeContractAsync({
      address: smSEI as `0x${string}`,
      abi: SEI_BRIDGE_ABI.abi,
      functionName: "burnTokenCCIP",
      args: [tokenId, amountInUnits],
      value:ccipFee,
    });
      await waitForTransactionReceipt(walletClient!,{ hash: result });
    setState((prev) => ({ ...prev, burnHash: result, isBridging: false, error: null }));
  } catch (err) {
    console.error("❌ ~ handleBurnUnlock error:", err);
    setState((prev) => ({
      ...prev,
      error: err instanceof Error ? err.message : "Bridge failed",
      isBridging: false,
      isNativeLockPending: false,
      isERC20LockPending: false,
    }));
    throw err;
  }
};

const handleLockMint = async (
  amount: string,
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
  tokenConfig: Token | undefined,
  tokenAddress: string | undefined,
  toChainSelector: string,
  receiver: string,
  ccipFee: bigint
): Promise<void> => {
  try {
    if (!writeContractAsync) throw new Error("Contract write not available");
    
    if (!tokenAddress) {
      const amountETHInWei = parseUnits(amount, 18);
      const amountTokenInDecimals = parseUnits(amount, 18);
      if (!balance || balance.value < amountETHInWei) {
        throw new Error(`Insufficient ETH balance. Required: ${formatUnits(amountETHInWei, 18)} ETH`);
      }
      setState((prev) => ({ ...prev, isBridging: true, error: null }));

        const result = await writeContractAsync({
          address: smETH as `0x${string}`,
          abi: ETH_BRIDGE_ABI.abi,
          functionName: "lockTokenVL",
          args: [tokenAddressNativeToken, amountTokenInDecimals, smSEI, receiver],
          value: amountETHInWei,
        });
      setState((prev) => ({ ...prev, nativeLockHash: result, isBridging: false, error: null }));
    } else {
      const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
      if (!balance || balance.value < amountInUnits) {
        throw new Error(`Insufficient ${tokenConfig?.symbol} balance. Required: ${amount}`);
      }

      try {
        await approveToken(tokenAddress as `0x${string}`, smETH as `0x${string}`, amount,tokenConfig?.decimals ?? 18,wallet?.address as `0x${string}`,walletClient);
      } catch (err: any) {
        const errorMessage = err.message === "Transaction rejected by user" ? "Giao dịch đã bị hủy bởi người dùng" : "Phê duyệt token thất bại";
        throw new Error(errorMessage);
      }
       setState((prev) => ({ ...prev, isBridging: true, error: null }));
      const formatted = formatUnits(ccipFee, 18);
        const result = await writeContractAsync({
        address: smETH as `0x${string}`,
        abi: ETH_BRIDGE_ABI.abi,
        functionName: "lockTokenCCIP",
        args: [tokenAddress as `0x${string}`, BigInt(toChainSelector), smSEI, receiver, amountInUnits, 0],
        value: parseUnits(formatted, 18),
      });
         setState((prev) => ({ ...prev, erc20LockHash: result, isBridging: false, error: null }))
    }
  } catch (err) {
    console.error("❌ ~ handleLockMint error:", err);
    setState((prev) => ({
      ...prev,
      error: err instanceof Error ? err.message : "Bridge failed",
      isBridging: false,
      isNativeLockPending: false,
      isERC20LockPending: false,
    }));
    throw err;
  }
};

const handleBurnWrappedToken = async (
  amount: string,
  receiver: string,
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined,
  tokenConfig: Token | undefined,
  wrappedTokenAddress: string | undefined,
): Promise<void> => {

  try {
     setState((prev) => ({ ...prev, isBridging: true, error: null }));
    if (!writeContractAsync) throw new Error("Contract write not available");

    const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
    if (!balance || balance.value < amountInUnits) {
      throw new Error(`Insufficient ${tokenConfig?.symbol} balance. Required: ${amount}`);
    }

    if (!wrappedTokenAddress) {
      throw new Error("Wrapped token address not provided");
    }

    // Approve the bridge contract to spend the wrapped tokens
    await approveToken(wrappedTokenAddress as `0x${string}`, smSEI as `0x${string}`, amount,tokenConfig?.decimals ?? 18,wallet?.address as `0x${string}`,walletClient);


    // Call the burnTokenVL function for wrapped tokens
    const result = await writeContractAsync({
      address: smSEI as `0x${string}`,
      abi: SEI_BRIDGE_ABI.abi,
      functionName: "burnTokenVL",
      args: [amountInUnits, wrappedTokenAddress as `0x${string}`,receiver],
      value: amountInUnits
    });


    setState((prev) => ({ ...prev, burnWrappedHash: result, isBridging: false, error: null }));
  } catch (err) {
    setState((prev) => ({
      ...prev,
      error: err instanceof Error ? err.message : "Burn wrapped token failed",
      isBridging: false,
      isNativeLockPending: false,
      isERC20LockPending: false,
    }));
    throw err;
  }
};

  return {
    isBridging: state.isBridging,
    isNativeLockPending,
    isERC20LockPending,
    state,
    erc20LockHash:state.erc20LockHash,
    burnWrappedHash:state.burnWrappedHash,
    burnHash:state.burnHash,
    nativeLockHash:state.nativeLockHash,
    error: state.error,
    handleBridge,
    routerAddress,
    isPaused,
    balance,
    refetchBalance,
    setState
  };
}