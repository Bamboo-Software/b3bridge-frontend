import ether from "@/assets/icons/ether.svg";
import sei from "@/assets/icons/sei.svg";
import seiABI from "./seiABI.json";
import ethereumABI from "./ethereumABI.json";

export const baseUrl =
  import.meta.env.VITE_API_URL || "https://bamboosoft.io/api";

// Ethereum Chain
export const ethereumChainSelector =
  import.meta.env.VITE_ETHEREUM_CHAIN_SELECTOR || "";
export const ethereumEthAddress =
  import.meta.env.VITE_ETHEREUM_ETH_ADDRESS || "";
export const ethereumUsdcAddress =
  import.meta.env.VITE_ETHEREUM_USDC_ADDRESS || "";
export const ethereumBridgeAddress =
  import.meta.env.VITE_ETHEREUM_BRIDGE_ADDRESS || "";
export const ethereumBridgeAbi =
  import.meta.env.VITE_ETHEREUM_BRIDGE_ABI || ethereumABI;

// SEI Chain
export const seiChainSelector = import.meta.env.VITE_SEI_CHAIN_SELECTOR || "";
export const seiEthAddress = import.meta.env.VITE_SEI_ETH_ADDRESS || "";
export const seiUsdcAddress = import.meta.env.VITE_SEI_USDC_ADDRESS || "";
export const seiBridgeAddress = import.meta.env.VITE_SEI_BRIDGE_ADDRESS || "";
export const seiBridgeAbi = import.meta.env.VITE_SEI_BRIDGE_ABI || seiABI;

export const CHAINS =
  import.meta.env.VITE_ENVIRONMENT == "production"
    ? [
        {
          id: "1",
          name: "Ethereum",
          avatar: ether,
          chainSelector: ethereumChainSelector,
          nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
          },
        },
        {
          id: "1329",
          name: "SEI",
          avatar: sei,
          chainSelector: seiChainSelector,
        },
      ]
    : [
        {
          id: "11155111",
          name: "Sepolia",
          avatar: ether,
          chainSelector: seiChainSelector,
          nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
          },
          blockExplorers: {
            default: {
              name: "Etherscan",
              url: "https://sepolia.etherscan.io",
            },
          },
          testnet: true,
        },
        {
          id: "1328",
          name: "SEI testnet",
          avatar: sei,
          nativeCurrency: {
            name: "Sei",
            symbol: "SEI",
            decimals: 18,
          },
          blockExplorers: {
            default: {
              name: "Sei Explorer",
              url: "https://sei.explorers.guru",
            },
          },
          chainSelector: seiChainSelector,
          testnet: true,
        },
      ];

export const TOKENS = {
  "1": {
    tokens: {
      eth: { symbol: "eth", name: "ETH", address: ethereumEthAddress },
      usdc: { symbol: "usdc", name: "USDC", address: ethereumUsdcAddress },
    },
    bridgeSmartcontract: {
      address: ethereumBridgeAddress,
      abi: ethereumBridgeAbi,
    },
  },
  "1328": {
    tokens: {
      eth: { symbol: "eth", name: "wETH", address: seiEthAddress },
      usdc: { symbol: "usdc", name: "wUSDC", address: seiUsdcAddress },
    },
    bridgeSmartcontract: { address: seiBridgeAddress, abi: seiBridgeAbi },
  },
  "11155111": {
    tokens: {
      eth: { symbol: "eth", name: "ETH", address: ethereumEthAddress },
      usdc: { symbol: "usdc", name: "USDC", address: ethereumUsdcAddress },
    },
    bridgeSmartcontract: {
      address: ethereumBridgeAddress,
      abi: ethereumBridgeAbi,
    },
  },
  "1329": {
    tokens: {
      eth: { symbol: "eth", name: "wETH", address: seiEthAddress },
      usdc: { symbol: "usdc", name: "wUSDC", address: seiUsdcAddress },
    },
    bridgeSmartcontract: { address: seiBridgeAddress, abi: seiBridgeAbi },
  },
};
