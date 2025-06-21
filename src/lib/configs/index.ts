import ether from "@/assets/icons/ether.svg";
import sei from "@/assets/icons/sei.svg";
import seiABI from './seiABI.json'
import ethereumABI from './ethereumABI.json'

export const baseUrl = import.meta.env.VITE_API_URL || 'https://bamboosoft.io/api';

// Ethereum Chain
export const ethereumChainSelector = import.meta.env.VITE_ETHEREUM_CHAIN_SELECTOR || '';
export const ethereumEthAddress = import.meta.env.VITE_ETHEREUM_ETH_ADDRESS || '';
export const ethereumUsdcAddress = import.meta.env.VITE_ETHEREUM_USDC_ADDRESS || '';
export const ethereumBridgeAddress = import.meta.env.VITE_ETHEREUM_BRIDGE_ADDRESS || '';
export const ethereumBridgeAbi = import.meta.env.VITE_ETHEREUM_BRIDGE_ABI || ethereumABI;

// SEI Chain
export const seiChainSelector = import.meta.env.VITE_SEI_CHAIN_SELECTOR || '';
export const seiEthAddress = import.meta.env.VITE_SEI_ETH_ADDRESS || '';
export const seiUsdcAddress = import.meta.env.VITE_SEI_USDC_ADDRESS || '';
export const seiBridgeAddress = import.meta.env.VITE_SEI_BRIDGE_ADDRESS || '';
export const seiBridgeAbi = import.meta.env.VITE_SEI_BRIDGE_ABI || seiABI;

export const CHAINS = [
  { name: "Ethereum", avatar: ether, id: "ethereum", chainSelector: ethereumChainSelector },
  { name: "SEI", avatar: sei, id: "sei", chainSelector: seiChainSelector },
];

export const TOKENS = {
  ethereum: {
    tokens: {
      eth: { symbol: "eth", name: "ETH", address: ethereumEthAddress },
      usdc: { symbol: "usdc", name: "USDC", address: ethereumUsdcAddress },
    },
    bridgeSmartcontract: { address: ethereumBridgeAddress, abi: ethereumBridgeAbi },
  },
  sei: {
    tokens: {
      eth: { symbol: "eth", name: "wETH", address: seiEthAddress },
      usdc: { symbol: "usdc", name: "wUSDC", address: seiUsdcAddress },
    },
    bridgeSmartcontract: { address: seiBridgeAddress, abi: seiBridgeAbi },
  },
};