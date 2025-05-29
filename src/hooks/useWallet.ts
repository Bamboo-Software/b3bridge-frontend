import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { networkConfig } from "@/configs/networkConfig";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const getCurrentChain = () => {
    if (!address) return null;
    return networkConfig.chains.find((c) => c.chain.id === c.chain.id)?.chain;
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnect,
    getCurrentChain,
  };
}