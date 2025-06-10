import { useState, useEffect } from "react";
import { useWriteContract, useTransaction, useSwitchChain, useBalance, useReadContract, useWalletClient, useReadContracts, usePublicClient } from "wagmi";
import { parseEther, parseUnits, encodeAbiParameters, formatEther, formatUnits, decodeErrorResult } from "viem";
import { erc20Abi } from "viem";
import { ethers, hexlify } from "ethers";
import { networkConfig, SEI_BRIDGE_ABI, SEPOLIA_BRIDGE_ABI, Token } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";
import { getBytes, getAddress } from "ethers";
import {  waitForTransactionReceipt, writeContract } from "viem/actions";
import { getBridgeAddress } from "@/utils";
import { seiTestnet, sepolia } from "wagmi/chains";
import { readContract } from '@wagmi/core'
import { config } from "@/configs/wagmi";
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "DECIMALS",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getDecimals",
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

export function useCCIPBridge() {
  const [isBridging, setIsBridging] = useState(false);
  const { data: walletClient } = useWalletClient()
  const [error, setError] = useState<string | null>(null);
  const [nativeLockHash, setNativeLockHash] = useState<`0x${string}` | undefined>();
  const [erc20LockHash, setErc20LockHash] = useState<`0x${string}` | undefined>();
  const [burnHash, setBurnHash] = useState<`0x${string}` | undefined>();
  const { wallets, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [selectedTokenConfig, setSelectedTokenConfig] = useState<Token | undefined>();
  const [fromChainId, setFromChainId] = useState<number | undefined>();
  const smETH = getBridgeAddress("ethereum");
  const smSEI = getBridgeAddress("sei"); 
  const address = fromChainId ? wallets[fromChainId]?.address : undefined;
 const { data: balance, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromChainId,
    token:
      fromChainId && selectedTokenConfig
        ? (selectedTokenConfig.address[fromChainId] as `0x${string}`)
        : undefined,
  });
  console.log("🚀 ~ useCCIPBridge ~ address:", address)
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

  // const { writeContractAsync: writeNative } = useWriteContract();
  // const { writeContractAsync: writeERC20 } = useWriteContract();
    const { writeContractAsync } = useWriteContract();

  const { isLoading: isNativeLockPending } = useTransaction({ hash: nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: erc20LockHash });

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
const isBurnUnlockOperation = (fromChainId: number, toChainId: number, toChainSelector: string, tokenAddress: string | undefined) => {
  const tokenConfig = tokenAddress
    ? networkConfig.tokensList.find((t) => Object.values(t.address).includes(tokenAddress as `0x${string}`))
    : networkConfig.tokensList.find((t) => t.symbol === "ETH");

 
  const originalChainId = sepolia.id; // Sepolia là chuỗi nguồn ban đầu
  return toChainId === originalChainId && toChainSelector === networkConfig.chainSelectors[sepolia.id];
};

function getWrappedOriginAddress(
  tokens: Token[],
  symbol: string,
  chainId: number
): string | undefined {
  const wrappedToken = tokens.find(t => t.symbol === symbol);
  if (!wrappedToken || !("wrappedFrom" in wrappedToken)) return undefined;

  const originToken = tokens.find(t => t.symbol === (wrappedToken as any).wrappedFrom);
  return originToken?.address?.[chainId];
}

  const handleBridge = async (
  fromChainId: number,
  toChainId: number,
  amount: string,
  balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  } | undefined,
  tokenAddress: string,
  receiver: string,
  toChainSelector: string,
  options?: {
    isOFT?: boolean;
  }
) => {
  if (!wallets[fromChainId]) {
    setError("Vui lòng kết nối ví trước");
    return;
  }

  try {
    setIsBridging(true);
    setError(null);
    setFromChainId(fromChainId);

    // Validate inputs
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Số lượng không hợp lệ");
    }
    if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Địa chỉ receiver không hợp lệ");
    }

    const currentChain = getCurrentChain(fromChainId);
    if (currentChain?.id !== fromChainId) {
      await switchChainAsync({ chainId: fromChainId });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refetchBalance();
    }

    const fromChainConfig = networkConfig.chains.find((c) => c.chain.id === fromChainId);
    const toChainConfig = networkConfig.chains.find((c) => c.chain.id === toChainId);
    if (!fromChainConfig || !toChainConfig) {
      throw new Error("Cấu hình chain không hợp lệ");
    }

    const destChainSelector = toChainSelector;
    const smETH = getBridgeAddress("ethereum");
    const smSEI = getBridgeAddress("sei");

    if (!smETH || (fromChainId !== seiTestnet.id && !smETH.match(/^0x[a-fA-F0-9]{40}$/))) {
      throw new Error(`Địa chỉ hợp đồng sender không hợp lệ cho chain ${fromChainId}`);
    }
    if (!smSEI) {
      throw new Error(`Địa chỉ hợp đồng receiver không hợp lệ cho chain ${toChainId}`);
    }

    setContractAddress(smETH as `0x${string}`);
    setTokenAddress(tokenAddress as `0x${string}`);

    const tokenConfig = tokenAddress
      ? networkConfig.tokensList.find((t) => Object.values(t.address).includes(tokenAddress as `0x${string}`))
      : networkConfig.tokensList.find((t) => t.symbol === "ETH");
    if (!tokenConfig && tokenAddress) {
      throw new Error("Cấu hình token không hợp lệ");
    }
    setSelectedTokenConfig(tokenConfig);

    let encodedDestAddress: `0x${string}`;
    let encodedReceiverAddress: `0x${string}`;
    if (toChainId === seiTestnet.id) {
      const seiAddressBytes = Buffer.from(smSEI.replace(/^0x/, ""), "hex");
      const receiverBytes = Buffer.from(receiver.replace(/^0x/, ""), "hex");
      encodedDestAddress = encodeAbiParameters([{ type: "bytes" }], [`0x${seiAddressBytes.toString("hex")}`]);
      encodedReceiverAddress = encodeAbiParameters([{ type: "bytes" }], [`0x${receiverBytes.toString("hex")}`]);
    } else {
      if (!smSEI.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`Địa chỉ hợp đồng receiver không hợp lệ cho chain ${toChainId}`);
      }
      if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Định dạng địa chỉ receiver không hợp lệ");
      }
      encodedDestAddress = encodeAbiParameters([{ type: "address" }], [smSEI as `0x${string}`]);
      encodedReceiverAddress = encodeAbiParameters([{ type: "address" }], [receiver as `0x${string}`]);
    }

    const isBurnUnlock = isBurnUnlockOperation(fromChainId, toChainId, toChainSelector, tokenAddress);
    console.log("🚀 ~ useCCIPBridge ~ isBurnUnlock:", isBurnUnlock)

    if (isBurnUnlock) {
      // Xử lý burn/unlock
      const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
      if (!balance || balance?.value < amountInUnits) {
        throw new Error(`Số dư ${tokenConfig?.symbol} không đủ. Yêu cầu: ${amount} ${tokenConfig?.symbol}`);
      }
      if (!writeContractAsync) {
        throw new Error("Contract write không sẵn sàng");
      }
      const tokenAddressSource = getWrappedOriginAddress(networkConfig.tokensList, balance.symbol, toChainId);
      console.log("🚀 ~ useCCIPBridge ~ tokenAddressSource:", tokenAddressSource)
      console.log(`🚀 ~ useCCIPBridge ~ {
        address: smSEI as ,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "tokenAddressToId",
        args: [
          tokenAddress as ,
          amountInUnits,
          BigInt(destChainSelector),
          encodedReceiverAddress,
        ],
      }:`, {
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: "tokenAddressToId",
        args: [
          tokenAddressSource as `0x${string}`
        ],
      })
      const tokenId = await readContract(config,{
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
        functionName: 'tokenAddressToId',
        args: ["0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"],
        chainId: 11155111,
      });
        if (!balance || balance?.value < amountInUnits) {
          throw new Error(`Số dư ${tokenConfig?.symbol} không đủ. Yêu cầu: ${amount} ${tokenConfig?.symbol}`);
        }
        if (!writeContractAsync) {
          throw new Error("Contract write không sẵn sàng");
        }
      if (!allowance || allowance < amountInUnits) {
          console.log("Đang phê duyệt chuyển token...");
          const approveTx = await writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [smSEI as `0x${string}`, amountInUnits],
          });
          await waitForTransactionReceipt(walletClient!, { hash: approveTx });
          console.log("Phê duyệt thành công, allowance được đặt thành:", formatUnits(amountInUnits, tokenConfig?.decimals || 18));
        }
      console.log("🚀 ~ useCCIPBridge ~ tokenId:", tokenId)
      const result = await writeContractAsync({
        address: smSEI as `0x${string}`,
        abi: SEI_BRIDGE_ABI.abi,
        functionName: "burnTokenCCIP",
        args: [
          tokenId,
          amountInUnits,
        ],
        value: parseUnits("600000000",9),
      });
      setBurnHash(result);
    }
    else
    {
      // Xử lý lock/mint
      if (!tokenAddress) {
        const amountInWei = parseEther(amount);
        if (!balance || balance?.value < amountInWei) {
          throw new Error(`Số dư ETH không đủ. Yêu cầu: ${formatEther(amountInWei)} ETH`);
        }
        if (!writeContractAsync) {
          throw new Error("Contract write không sẵn sàng");
        }
        const result = await writeContractAsync({
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockNative",
          args: [BigInt(destChainSelector), encodedDestAddress, encodedReceiverAddress, amountInWei],
          value: amountInWei,
        });
        setNativeLockHash(result);
      } else {
        const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
        if (!balance || balance?.value < amountInUnits) {
          throw new Error(`Số dư ${tokenConfig?.symbol} không đủ. Yêu cầu: ${amount} ${tokenConfig?.symbol}`);
        }
        if (!writeContractAsync) {
          throw new Error("Contract write không sẵn sàng");
        }
        if (!allowance || allowance < amountInUnits) {
          console.log("Đang phê duyệt chuyển token...");
          const approveTx = await writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [smETH as `0x${string}`, amountInUnits],
          });
          await waitForTransactionReceipt(walletClient!, { hash: approveTx });
          console.log("Phê duyệt thành công, allowance được đặt thành:", formatUnits(amountInUnits, tokenConfig?.decimals || 18));
        }
        const result = await writeContractAsync({
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockTokenCCIP",
          args: [
            tokenAddress as `0x${string}`,
            BigInt(destChainSelector),
            smSEI,
            receiver,
            amountInUnits,
            0,
          ],
          value: parseEther("0.01"),
        });
        setErc20LockHash(result);
      }
    }
  } catch (err) {
    console.error("Lỗi bridge:", err);
    setError(err instanceof Error ? err.message : "Bridge thất bại");
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
    routerAddress,
    isPaused,
    balance,
    refetchBalance,
  };
}