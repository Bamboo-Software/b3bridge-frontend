import { ChainId } from '@/utils/enums/chain';
import etherLogo from "@/assets/icons/ether.svg";
import seiLogo from "@/assets/icons/sei.svg";
import bscLogo from "@/assets/icons/bsc-logo.svg";
import avalancheLogo from "@/assets/icons/avalanche-logo.svg";
import { appConfig } from '../app';
import { avalanche, avalancheFuji, bsc, bscTestnet, mainnet, sei, seiTestnet, sepolia, type Chain } from 'viem/chains';
import ethereumABI from "./ethereumABI.json";
import routerCCIP from "./routerCCIP.json";
import presaleABI from "./presaleABI.json";
import seiABI from "./seiABI.json";

export const baseUrl =
  import.meta.env.VITE_API_URL || "";

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
export const ethereumRouterAddress =
  import.meta.env.VITE_ETHEREUM_CHAIN_ROUTER || ethereumABI;

// SEI Chain
export const seiChainSelector = import.meta.env.VITE_SEI_CHAIN_SELECTOR || "";
export const seiEthAddress = import.meta.env.VITE_SEI_ETH_ADDRESS || "";
export const seiUsdcAddress = import.meta.env.VITE_SEI_USDC_ADDRESS || "";
export const seiBridgeAddress = import.meta.env.VITE_SEI_BRIDGE_ADDRESS || "";
export const seiRouterAddress = import.meta.env.VITE_SEI_CHAIN_ROUTER || "";
export const seiBridgeAbi = import.meta.env.VITE_SEI_BRIDGE_ABI || seiABI;
export const chainSelectors: Record<number, string> = {
  [sepolia.id]: ethereumChainSelector,
  [seiTestnet.id]: seiChainSelector,
};

// router CCIP
export const routerCCIPAbi =
  import.meta.env.VITE_ETHEREUM_BRIDGE_ABI || routerCCIP;

export const blockChainConfig = {
  ethereumEthAddress,
  ethereumUsdcAddress,
  ethereumRouterAddress,
  ethereumBridgeAddress,
  seiRouterAddress,
  ethereumBridgeAbi,
  seiEthAddress,
  routerCCIPAbi,
  seiUsdcAddress,
  seiBridgeAddress,
  seiBridgeAbi
}

export const chainImages = {
  [ChainId.Ethereum] : etherLogo,
  [ChainId.SEI]: seiLogo,
  [ChainId.BSC]: bscLogo,
  [ChainId.AVALANCHE]: avalancheLogo,
}

const isProd = appConfig?.isProd
export const configChains = (isProd ? [mainnet, sei] : [sepolia, seiTestnet]) as [Chain, ...Chain[]]

export const configLaunchPadsChains = (isProd ? [mainnet, avalanche, bsc] : [sepolia, avalancheFuji, bscTestnet]) as [Chain, ...Chain[]];



export const EVM_CHAIN_IDS = new Set<number| string>([
  ChainId.Ethereum,
  ChainId.SEI,
  ChainId.BSC,
  ChainId.AVALANCHE,
]);

export const CHAIN_ENV_KEYS: Record<number, string> = {
  [sepolia.id]: 'ETH',
  [seiTestnet.id]: 'SEI',
};

export const presaleContractAbi = presaleABI;