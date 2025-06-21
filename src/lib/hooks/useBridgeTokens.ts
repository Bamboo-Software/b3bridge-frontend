import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from 'wagmi';
import { CHAINS, TOKENS } from "@/lib/configs";
import { bridgeFormSchema, type BridgeFormValues } from "@/lib/types/schemas/bridge";
import type { BridgeFormData } from "@/pages/home/components/BridgeFormWrap";

export const useBridgeTokens = (onSubmit: (data: BridgeFormData) => void) => {
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS[1]);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("eth");
  const { address, isConnected } = useAccount();

  const getTokensForChain = useCallback((chainId: string) => {
    const chain = TOKENS[chainId as keyof typeof TOKENS];
    if (!chain) return [];

    return Object.values(chain.tokens).map(token => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address
    }));
  }, []);

  const getSelectedToken = useCallback(() => {
    const chain = TOKENS[fromChain.id as keyof typeof TOKENS];
    if (!chain) return { symbol: "", name: "", address: "" };

    const token = chain.tokens[selectedTokenSymbol as keyof typeof chain.tokens];
    return token || { symbol: "", name: "", address: "" };
  }, [fromChain.id, selectedTokenSymbol]);

  const getDestinationToken = useCallback(() => {
    const chain = TOKENS[toChain.id as keyof typeof TOKENS];
    if (!chain) return { symbol: "", name: "", address: "" };

    const token = chain.tokens[selectedTokenSymbol as keyof typeof chain.tokens];
    return token || { symbol: "", name: "", address: "" };
  }, [toChain.id, selectedTokenSymbol]);

  const selectedToken = getSelectedToken();
  const destinationToken = getDestinationToken();
  const availableTokens = getTokensForChain(fromChain.id);

  const form = useForm<BridgeFormValues>({
    resolver: zodResolver(bridgeFormSchema),
    defaultValues: {
      fromChain: CHAINS[0],
      toChain: CHAINS[1],
      fromWalletAddress: "",
      toWalletAddress: "",
      tokenAddress: selectedToken.address,
      tokenSymbol: selectedToken.symbol,
      amount: "",
    },
  });

  useEffect(() => {
    if (fromChain.id === toChain.id) {
      const otherChain = CHAINS.find(chain => chain.id !== fromChain.id);
      if (otherChain) {
        setToChain(otherChain);
        form.setValue("toChain", otherChain);
      }
    }
  }, [fromChain, toChain, form]);

  useEffect(() => {
    const token = getSelectedToken();
    form.setValue("tokenAddress", token.address);
    form.setValue("tokenSymbol", token.symbol);
  }, [fromChain, selectedTokenSymbol, form, getSelectedToken]);

  useEffect(() => {
    if (isConnected && address) {
      form.setValue("fromWalletAddress", address);
    }
  }, [isConnected, address, form]);

  const handleFromChainChange = (value: string) => {
    const chain = CHAINS.find(c => c.id === value) || CHAINS[0];
    setFromChain(chain);
    form.setValue("fromChain", chain);

    if (toChain.id === value) {
      const otherChain = CHAINS.find(c => c.id !== value);
      if (otherChain) {
        setToChain(otherChain);
        form.setValue("toChain", otherChain);
      }
    }
  };

  const handleToChainChange = (value: string) => {
    if (value === fromChain.id) {
      return;
    }

    const chain = CHAINS.find(c => c.id === value) || CHAINS[1];
    setToChain(chain);
    form.setValue("toChain", chain);
  };

  const handleTokenChange = (value: string) => {
    setSelectedTokenSymbol(value);
    form.setValue("tokenSymbol", value);

    const chain = TOKENS[fromChain.id as keyof typeof TOKENS];
    if (chain) {
      const token = chain.tokens[value as keyof typeof chain.tokens];
      if (token) {
        form.setValue("tokenAddress", token.address);
      }
    }
  };

  const handleSubmit = (values: BridgeFormValues) => {
    try {
      const fromChainData = {
        name: values.fromChain.name,
        id: values.fromChain.id,
        chainSelector: values.fromChain.chainSelector
      };

      const toChainData = {
        name: values.toChain.name,
        id: values.toChain.id,
        chainSelector: values.toChain.chainSelector
      };

      onSubmit({
        ...values,
        fromChain: fromChainData,
        toChain: toChainData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return {
    form,
    fromChain,
    toChain,
    selectedTokenSymbol,
    selectedToken,
    destinationToken,
    availableTokens,
    handleFromChainChange,
    handleToChainChange,
    handleTokenChange,
    handleSubmit,
    isConnected,
  };
};