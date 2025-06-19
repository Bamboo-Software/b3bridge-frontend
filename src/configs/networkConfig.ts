import { Address } from "viem";
import { arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, Chain, optimismSepolia, polygonAmoy, sepolia } from "viem/chains";
import NativeBridgeABI from "@/constants/contracts/ccip-eth-sepolia.json";
import B3BridgeDest from "@/constants/contracts/ccip-sei-testnet.json";
export const seiTestnet = {
  id: 1328,
  name: 'Sei Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.atlantic-2.seinetwork.io'], wss: ['wss://evm-ws-testnet.sei-apis.com'] },
  public: { http: ['https://evm-rpc.atlantic-2.seinetwork.io'] },
},
  blockExplorers: {
  default: { name: 'Sei EVM Explorer', url: 'https://sei.explorers.guru' },
},
  testnet: true,
};

export declare type Token = {
  /** The token's symbol that will be shown in the UI  */
  symbol: string;
  /** The token's address, represented as a mapping by chainId */
  address: AddressMap;
  wrappedFrom?: string;
  /** URL of the token's logo that will be shown in the UI */
  logoURL: string;
  /** A list of meta information tags for organizing and sorting */
  tags?: string[];
  /** The number of decimals for the token */
  decimals?: number;
};

export declare type AddressMap = {
  [chainId: number]: Address | undefined;
};

export declare type NetworkConfig = {
  /** List of all chains that should be supported */
  chains: {
    chain: Chain;
    logoURL?: string;
  }[];
  tokensList: Token[];
  /** Addresses for the LINK token contract on the corresponding chains */
  linkContracts: AddressMap;
  /** Addresses for the router contracts on the corresponding chains */
  routerAddresses: AddressMap;
  /** Selectors for the chains that should be supported */
  chainSelectors: {
    [chainId: number]: string;
  };
  /** CCIP contracts for separate token transfers */
  ccipContracts: {
    sender: AddressMap;
    receiver: AddressMap;
  };
};

const tokensList: Token[] = [
  {
    symbol: "ETH",
    address: {
      [sepolia.id]: undefined,
      // [seiTestnet.id]: undefined,
    },
    decimals: 18,
    logoURL: "/images/eth.avif",
    tags: ["native", "default"],
  },
  {
    symbol: "USDC",
    address: {
      [sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    },
    decimals: 6,
    logoURL: "/images/usdc.avif",
    tags: ["stablecoin", "default"],
  },
  {
    symbol: "wUSDC",
    wrappedFrom: "USDC",
    address: {
    [seiTestnet.id]: "0x12CD8503ECBd48B4c3F920c48565a56c328207E4",
  },
  decimals: 6,
  logoURL: "/images/usdc.avif",
  tags: ["wrapped", "stablecoin"],
  },
  {
    symbol: "wETH",
    wrappedFrom: "ETH",
    address: {
    [seiTestnet.id]: "0x087cFed0f5993e6C849172c5Ad59A3FD67FA3b99",
  },
  decimals: 6,
  logoURL: "/images/eth.avif",
  tags: ["wrapped", "default"],
  }
];

const chains = [
  {
    chain: sepolia,
    logoURL: "/svg/ethereum.svg"
  },
  {
    chain: seiTestnet,
    logoURL: "/svg/sei.svg"
  },
];

const linkContracts: AddressMap = {
  [sepolia.id]: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  [seiTestnet.id]: "0x..." as Address,
};

const routerAddresses: AddressMap = {
  [sepolia.id]: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  [seiTestnet.id]: "0x59F5222c5d77f8D3F56e34Ff7E75A05d2cF3a98A",
};

export const chainSelectors: Record<number, string> = {
  [sepolia.id]: "16015286601757825753",
  [seiTestnet.id]: "1216300075444106652",
};

const ccipContracts = {
  sender: {
    [sepolia.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,
    [seiTestnet.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
  },
  receiver: {

    [sepolia.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,

    [seiTestnet.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
  },
};

export const networkConfig: NetworkConfig = {
  chains,
  linkContracts,
  routerAddresses,
  chainSelectors,
  tokensList,
  ccipContracts,
};

// Import the ABI
export const SEPOLIA_BRIDGE_ABI = NativeBridgeABI;
export const SEI_BRIDGE_ABI = B3BridgeDest;
