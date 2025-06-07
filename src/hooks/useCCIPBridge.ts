import { useState, useEffect } from "react";
import { useWriteContract, useTransaction, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { parseEther, parseUnits, encodeAbiParameters, formatEther, formatUnits, decodeErrorResult } from "viem";
import { erc20Abi } from "viem";
import { ethers, hexlify } from "ethers";
import { networkConfig, SEPOLIA_BRIDGE_ABI, Token, walletClient } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";
import { getBytes, getAddress } from "ethers";
import { waitForTransactionReceipt, writeContract } from "viem/actions";

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

export function useBridge() {
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nativeLockHash, setNativeLockHash] = useState<`0x${string}` | undefined>();
  const [erc20LockHash, setErc20LockHash] = useState<`0x${string}` | undefined>();
  const { wallets, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [selectedTokenConfig, setSelectedTokenConfig] = useState<Token | undefined>();
  const [fromChainId, setFromChainId] = useState<number | undefined>();
  const testFromChainId = 11155111;
  const testToChainId = 1328;
  const testDestChainSelector = 1216300075444106652;
  const smETH = "0x740edCEcACf42130f3f72e9ae86202b05D725adE";// Bridge smartcontract
  const testSender = "0x308B995e0b6C43CF00b65192f76AFa0E292B42b1";  // dia chi vi gui
  const smSEI = "0x8d85d2ffc10cc36B499F1D3021D4e19D23A6de3e";// destination wallet nếu là sei thì địa chỉ ví keplr
  const walletSEI = "0x8d85d2ffc10cc36B499F1D3021D4e19D23A6de3e";// destination wallet nếu là sei thì địa chỉ ví keplr
  const testTokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";// USDC token address
  const testAmount = "0.01";

  // Chỉ gọi useBalance khi fromChainId tồn tại
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: fromChainId ? wallets[fromChainId] as `0x${string}` | undefined : undefined,
    chainId: fromChainId,
    token: fromChainId && selectedTokenConfig?.symbol === "ETH" ? undefined : (fromChainId ? selectedTokenConfig?.address[fromChainId] as `0x${string}` | undefined : undefined),
  });

  // Chỉ query allowance khi có cả token và contract address
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

  const { writeContractAsync: writeNative } = useWriteContract();
  const { writeContractAsync: writeERC20 } = useWriteContract();

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

  const handleBridge = async (
    fromChainId: number,
    toChainId: number,
    amount: string,
    tokenAddress: string,
    receiver: string,
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

      const fromChainConfig = networkConfig.chains.find((c) => c.chain.id === testFromChainId);
      const toChainConfig = networkConfig.chains.find((c) => c.chain.id === testToChainId);
      if (!fromChainConfig || !toChainConfig) {
        throw new Error("Cấu hình chain không hợp lệ");
      }

      const destChainSelector = testDestChainSelector;

      if (!smETH || !smETH.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`Địa chỉ hợp đồng sender không hợp lệ cho chain ${fromChainId}`);
      }
      if (!smSEI) {
        throw new Error(`Địa chỉ hợp đồng receiver không hợp lệ cho chain ${toChainId}`);
      }

      setContractAddress(smETH as `0x${string}`);
      setTokenAddress(testTokenAddress as `0x${string}`);

      // Get token config
      const tokenConfig = testTokenAddress
        ? networkConfig.tokensList.find((t) => Object.values(t.address).includes(testTokenAddress as `0x${string}`))
        : networkConfig.tokensList.find((t) => t.symbol === "ETH");
      if (!tokenConfig && testTokenAddress) {
        throw new Error("Cấu hình token không hợp lệ");
      }
      setSelectedTokenConfig(tokenConfig);

      let encodedDestAddress: `0x${string}`;
      let encodedReceiverAddress: `0x${string}`;
      if (toChainId === 1328) {
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

      if (!testTokenAddress) {
        const amountInWei = parseEther(amount);
        if (!balance || balance.value < amountInWei) {
          throw new Error(`Số dư ETH không đủ. Yêu cầu: ${formatEther(amountInWei)} ETH`);
        }
        if (!writeNative) {
          throw new Error("Contract write không sẵn sàng");
        }
        const result = await writeNative({
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockNative",
          args: [BigInt(destChainSelector), encodedDestAddress, encodedReceiverAddress, amountInWei],
          value: amountInWei,
        });
        setNativeLockHash(result);
      } else if (options?.isOFT) {
        const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
        if (!balance || balance.value < amountInUnits) {
          throw new Error(`Số dư ${tokenConfig?.symbol} không đủ. Yêu cầu: ${amount} ${tokenConfig?.symbol}`);
        }
        if (!writeERC20) {
          throw new Error("Contract write không sẵn sàng");
        }
        const result = await writeERC20({
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockOFT",
          args: [
            tokenAddress as `0x${string}`,
            amountInUnits,
            BigInt(destChainSelector),
            encodedDestAddress,
            encodedReceiverAddress,
          ],
        });
        setErc20LockHash(result);
      } else {
        const amountInUnits = parseUnits(amount, tokenConfig?.decimals || 18);
        if (!balance || balance.value < amountInUnits) {
          throw new Error(`Số dư ${tokenConfig?.symbol} không đủ. Yêu cầu: ${amount} ${tokenConfig?.symbol}`);
        }
        if (!writeERC20) {
          throw new Error("Contract write không sẵn sàng");
        }

        if (!allowance || allowance < amountInUnits) {
          console.log("Đang phê duyệt chuyển token...");
          const approveTx = await writeERC20({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [smETH as `0x${string}`, amountInUnits],
          });
          await waitForTransactionReceipt(walletClient, { hash: approveTx });
          console.log("Phê duyệt thành công, allowance được đặt thành:", formatUnits(amountInUnits, tokenConfig?.decimals || 18));
        }
        
        console.log(`🚀 ~ useBridge ~ {
          address: smETH as ,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockERC20",
          args: [
            tokenAddress as ,
            amountInUnits,
            BigInt(destChainSelector),
            encodedDestAddress,
            encodedReceiverAddress,
          ],
          value: parseEther("0.02"),
        }:`, {
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockERC20",
          args: [
            tokenAddress as `0x${string}`,
            amountInUnits,
            BigInt(destChainSelector),
            encodedDestAddress,
            encodedReceiverAddress,
          ],
          value: parseEther("0.02"),
        })
        const result = await writeERC20({
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: "lockERC20",
          args: [
            tokenAddress as `0x${string}`,
            amountInUnits,
            BigInt(destChainSelector),
            encodedDestAddress,
            encodedReceiverAddress,
          ],
          value: parseEther("0.01"),
        });
        setErc20LockHash(result);
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