import { useState, useEffect } from "react";
import { useWriteContract, useTransaction, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { parseEther, parseUnits, encodeAbiParameters, formatEther, formatUnits, decodeErrorResult } from "viem";
import { erc20Abi } from "viem";
import { networkConfig, SEPOLIA_BRIDGE_ABI, Token } from "@/configs/networkConfig";
import { useWallet } from "./useWallet";

export function useBridge() {
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nativeLockHash, setNativeLockHash] = useState<`0x${string}` | undefined>();
  const [erc20LockHash, setErc20LockHash] = useState<`0x${string}` | undefined>();
  const { address, isConnected, getCurrentChain } = useWallet();
  const { switchChainAsync } = useSwitchChain();
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [selectedTokenConfig, setSelectedTokenConfig] = useState<Token | undefined>();
  const [fromChainId, setFromChainId] = useState<number | undefined>();

  // Lấy balance dựa vào chain nguồn (fromChainId)
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: fromChainId,
    token: selectedTokenConfig?.symbol === "ETH" ? undefined : selectedTokenConfig?.address[fromChainId || 0],
  });

  // Chỉ query allowance khi có cả token và contract address
  const { data: allowance } = useReadContract(
    tokenAddress && contractAddress
      ? {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address as `0x${string}`, contractAddress as `0x${string}`],
        }
      : undefined
  );

  const { writeContractAsync: writeNative } = useWriteContract();
  const { writeContractAsync: writeERC20 } = useWriteContract();

  const { isLoading: isNativeLockPending } = useTransaction({ hash: nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: erc20LockHash });

  const { data: minFee } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI,
    functionName: "minCCIPFee",
    chainId: fromChainId,
  });

  const { data: maxFee } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI,
    functionName: "maxCCIPFee",
    chainId: fromChainId,
  });

  // Log giá trị minFee và maxFee khi chúng thay đổi
  useEffect(() => {
    console.log("Contract fee values:", {
      minFee: minFee ? formatEther(BigInt(minFee.toString())) : "0",
      maxFee: maxFee ? formatEther(BigInt(maxFee.toString())) : "0",
      contractAddress,
      chainId: fromChainId,
    });
  }, [minFee, maxFee, contractAddress, fromChainId]);

  const { data: routerAddress } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI,
    functionName: "getRouter",
  });

  const { data: isPaused } = useReadContract({
    address: contractAddress,
    abi: SEPOLIA_BRIDGE_ABI,
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
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsBridging(true);
      setError(null);
      setFromChainId(fromChainId);

      // Kiểm tra contract có bị paused không
      if (isPaused) {
        throw new Error("Bridge contract is currently paused");
      }

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
        // Đợi một chút để chain switch hoàn tất và balance được cập nhật
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetchBalance();
      }

      const fromChainConfig = networkConfig.chains.find((c) => c.chain.id === fromChainId);
      const toChainConfig = networkConfig.chains.find((c) => c.chain.id === toChainId);
      if (!fromChainConfig || !toChainConfig) {
        throw new Error("Invalid chain configuration");
      }

      // Get chain selector for destination chain
      const destChainSelector = networkConfig.chainSelectors[toChainId];
      if (!destChainSelector) {
        throw new Error(`Invalid chain selector for chain ${toChainId}`);
      }

      // Lấy địa chỉ contract sender và receiver
      const senderContractAddress = networkConfig.ccipContracts.sender[fromChainId];
      const receiverContractAddress = networkConfig.ccipContracts.receiver[toChainId];

      if (!senderContractAddress) {
        throw new Error(`Invalid sender contract address for chain ${fromChainId}`);
      }

      // Kiểm tra địa chỉ sender contract có phải là EVM address không
      if (fromChainId !== 713715 && !senderContractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`Invalid sender contract address format for chain ${fromChainId}`);
      }

      if (!receiverContractAddress) {
        throw new Error(`Invalid receiver contract address for chain ${toChainId}`);
      }

      setContractAddress(senderContractAddress as `0x${string}`);
      setTokenAddress(tokenAddress as `0x${string}`);

      // Lấy token config
      const tokenConfig = tokenAddress
        ? networkConfig.tokensList.find((t) => Object.values(t.address).includes(tokenAddress as `0x${string}`))
        : networkConfig.tokensList.find((t) => t.symbol === "ETH");
      setSelectedTokenConfig(tokenConfig);

      // Encode địa chỉ receiver contract và địa chỉ ví người nhận
      let encodedDestAddress: `0x${string}`;
      let encodedReceiverAddress: `0x${string}`;

      if (toChainId === 1328) {
        // Sei network
        // Convert Sei address to bytes without 0x prefix
        const seiAddressBytes = Buffer.from(receiverContractAddress);
        const receiverBytes = Buffer.from(receiver);

        encodedDestAddress = encodeAbiParameters([{ type: "bytes" }], [`0x${seiAddressBytes.toString("hex")}`]);
        encodedReceiverAddress = encodeAbiParameters([{ type: "bytes" }], [`0x${receiverBytes.toString("hex")}`]);
      } else {
        // For EVM chains, encode as address
        if (!receiverContractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error(`Invalid receiver contract address format for chain ${toChainId}`);
        }
        if (!receiver.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error("Invalid receiver address format");
        }

        encodedDestAddress = encodeAbiParameters([{ type: "address" }], [receiverContractAddress as `0x${string}`]);
        encodedReceiverAddress = encodeAbiParameters([{ type: "address" }], [receiver as `0x${string}`]);
      }

      // Log thông tin để debug
      console.log("Bridge parameters:", {
        fromChainId,
        toChainId,
        amount,
        tokenAddress,
        receiver,
        senderContractAddress,
        receiverContractAddress,
        encodedDestAddress,
        encodedReceiverAddress,
        balance: balance ? formatEther(balance.value) : "0",
        tokenConfig,
      });

      if (!tokenAddress) {
        // Bridge native token (ETH)
        const amountInWei = parseEther(amount);

        // Lấy phí CCIP từ contract và đảm bảo chuyển đổi đúng kiểu
        const minFeeValue = minFee ? BigInt(minFee.toString()) : BigInt(0);
        const maxFeeValue = maxFee ? BigInt(maxFee.toString()) : BigInt(0);

        // Log raw values từ contract
        console.log("Raw contract fee values:", {
          minFee,
          maxFee,
          minFeeValue: minFeeValue.toString(),
          maxFeeValue: maxFeeValue.toString(),
        });

        // Tính phí CCIP cho Sei network
        const ccipFee = toChainId === 1328 ? BigInt("1000000000000000") : minFeeValue; // 0.001 ETH cho Sei

        // Log thông tin phí
        console.log("CCIP Fee details:", {
          minFee: formatEther(minFeeValue),
          maxFee: formatEther(maxFeeValue),
          currentFee: formatEther(ccipFee),
          chainId: toChainId,
          chainSelector: destChainSelector,
          fromChainId,
          contractAddress,
        });

        // Kiểm tra phí có nằm trong khoảng cho phép không
        if (minFeeValue === BigInt(0) && maxFeeValue === BigInt(0)) {
          console.warn("Warning: Contract fee values are both 0, this might indicate an issue with contract reading");
        }

        if (ccipFee < minFeeValue || ccipFee > maxFeeValue) {
          throw new Error(
            `CCIP fee out of range. Required: ${formatEther(ccipFee)} ETH, ` +
              `Min: ${formatEther(minFeeValue)} ETH, Max: ${formatEther(maxFeeValue)} ETH. ` +
              `Please check contract configuration.`
          );
        }

        const totalRequired = amountInWei + ccipFee;

        // Log thông tin balance check
        console.log("Balance check:", {
          balance: balance ? formatEther(balance.value) : "0",
          amount: formatEther(amountInWei),
          fee: formatEther(ccipFee),
          totalRequired: formatEther(totalRequired),
        });

        // Kiểm tra số dư native token
        if (!balance) {
          throw new Error("Failed to fetch balance. Please try again.");
        }

        if (balance.value < totalRequired) {
          throw new Error(
            `Insufficient ETH balance. Required: ${formatEther(totalRequired)} ETH (${formatEther(amountInWei)} ETH + ${formatEther(ccipFee)} ETH fee)`
          );
        }

        if (!writeNative) {
          throw new Error("Contract write not ready");
        }

        const result = await writeNative({
          address: senderContractAddress as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI,
          functionName: "lockNative",
          args: [BigInt(destChainSelector), encodedDestAddress, encodedReceiverAddress, amountInWei],
          value: totalRequired,
        });
        setNativeLockHash(result);
      } else if (options?.isOFT) {
        // Bridge OFT token
        if (!tokenConfig) {
          throw new Error("Invalid token configuration");
        }
        const amountInUnits = parseUnits(amount, tokenConfig.decimals || 18);

        const result = await writeERC20({
          address: senderContractAddress as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI,
          functionName: "lockOFT",
          args: [tokenAddress as `0x${string}`, amountInUnits, BigInt(destChainSelector), encodedDestAddress, encodedReceiverAddress],
        });
        setErc20LockHash(result);
      } else {
        // Bridge ERC20 token
        if (!tokenConfig) {
          throw new Error("Invalid token configuration");
        }
        const amountInUnits = parseUnits(amount, tokenConfig.decimals || 18);

        // Log thông tin balance check cho ERC20
        console.log("ERC20 Balance check:", {
          balance: balance ? formatUnits(balance.value, tokenConfig.decimals || 18) : "0",
          amount,
          token: tokenConfig.symbol,
        });

        // Kiểm tra số dư ERC20 token
        if (!balance) {
          throw new Error("Failed to fetch balance. Please try again.");
        }

        if (balance.value < amountInUnits) {
          throw new Error(`Insufficient ${tokenConfig.symbol} balance. Required: ${amount} ${tokenConfig.symbol}`);
        }

        if (!allowance || allowance < amountInUnits) {
          await writeERC20({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [senderContractAddress as `0x${string}`, amountInUnits],
          });
        }

        if (!writeERC20) {
          throw new Error("Contract write not ready");
        }

        // Tính phí CCIP
        const minFeeValue = minFee ? BigInt(minFee.toString()) : BigInt(0);
        const maxFeeValue = maxFee ? BigInt(maxFee.toString()) : BigInt(0);

        // Tính phí CCIP cho Sei network
        const ccipFee = toChainId === 1328 ? BigInt("10000000000000000") : minFeeValue; // 0.001 ETH cho Sei

        // Kiểm tra phí có hợp lệ không
        if (ccipFee < minFeeValue || ccipFee > maxFeeValue) {
          throw new Error(
            `CCIP fee out of range. Required: ${formatEther(ccipFee)} ETH, ` +
            `Min: ${formatEther(minFeeValue)} ETH, Max: ${formatEther(maxFeeValue)} ETH.`
          );
        }

        // Thêm phí CCIP vào transaction
        const result = await writeERC20({
          address: senderContractAddress as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI,
          functionName: "lockERC20",
          args: [tokenAddress as `0x${string}`, amountInUnits, BigInt(destChainSelector), encodedDestAddress, encodedReceiverAddress],
          value: ccipFee, // Thêm phí CCIP vào đây
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
    minCCIPFee: minFee,
    maxCCIPFee: maxFee,
    routerAddress,
    isPaused,
    balance,
    refetchBalance,
  };
}
