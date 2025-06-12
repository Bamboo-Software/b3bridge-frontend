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
  default: { http: ['https://evm-rpc.atlantic-2.seinetwork.io'] },
  public: { http: ['https://evm-rpc.atlantic-2.seinetwork.io'] },
},
  blockExplorers: {
  default: { name: 'Sei EVM Explorer', url: 'https://sei.explorers.guru' },
},
  testnet: true,
} as const;

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
      [seiTestnet.id]: undefined,
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
    [seiTestnet.id]: "0x55aAFA704BD5ab1E50b3CeB33f7e9457Cb41A955",
  },
  decimals: 6,
  logoURL: "/images/usdc.avif",
  tags: ["wrapped", "stablecoin"],
  },
  {
    symbol: "wETH",
    wrappedFrom: "ETH",
    address: {
    [seiTestnet.id]: "0x42B4fdB1888001BB4C06f8BaFfB8a96B56693614",
  },
  decimals: 18,
  logoURL: "/images/eth.avif",
  tags: ["wrapped", "default"],
  }
];

const chains = [
  // {
  //   chain: arbitrumSepolia,
  //   logoURL: "/svg/arbitrum.svg",
  // },
  // {
  //   chain: avalancheFuji,
  //   logoURL: "/svg/avalanche.svg",
  // },
  // {
  //   chain: baseSepolia,
  //   logoURL: "/svg/base.svg",
  // },
  // {
  //   chain: bscTestnet,
  //   logoURL: "/svg/bsc.svg"
  // },
  {
    chain: sepolia,
    logoURL: "/svg/ethereum.svg"
  },
  // {
  //   chain: optimismSepolia,
  //   logoURL: "/svg/optimism.svg"
  // },
  // {
  //   chain: polygonAmoy,
  //   logoURL: "/svg/polygon.svg"
  // },
  {
    chain: seiTestnet,
    logoURL: "/svg/sei.svg"
  },
];

const linkContracts: AddressMap = {
  [arbitrumSepolia.id]: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
  [avalancheFuji.id]: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  [baseSepolia.id]: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  [bscTestnet.id]: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
  [sepolia.id]: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  [optimismSepolia.id]: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  [polygonAmoy.id]: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
  [seiTestnet.id]: "0x..." as Address,
};

const routerAddresses: AddressMap = {
  [arbitrumSepolia.id]: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
  [avalancheFuji.id]: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  [baseSepolia.id]: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
  [bscTestnet.id]: "0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f",
  [sepolia.id]: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  [optimismSepolia.id]: "0x114a20a10b43d4115e5aeef7345a1a71d2a60c57",
  [polygonAmoy.id]: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
  [seiTestnet.id]: "0x59F5222c5d77f8D3F56e34Ff7E75A05d2cF3a98A",
};

export const chainSelectors: Record<number, string> = {
  [arbitrumSepolia.id]: "3478487238524512106",
  [avalancheFuji.id]: "14767482510784806043",
  [baseSepolia.id]: "10344971235874465080",
  [bscTestnet.id]: "13264668187771770619",
  [sepolia.id]: "16015286601757825753",
  [optimismSepolia.id]: "5224473277236331295",
  [polygonAmoy.id]: "16281711391670634445",
  [seiTestnet.id]: "1216300075444106652",
};

const ccipContracts = {
  sender: {
    [arbitrumSepolia.id]: "0x..." as Address,
    [avalancheFuji.id]: "0x..." as Address,
    [baseSepolia.id]: "0x..." as Address,
    [bscTestnet.id]: "0x..." as Address,
    [sepolia.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,
    [optimismSepolia.id]: "0x..." as Address,
    [polygonAmoy.id]: "0x..." as Address,
    [seiTestnet.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
  },
  receiver: {
    [arbitrumSepolia.id]: "0x..." as Address,
    [avalancheFuji.id]: "0x..." as Address,
    [baseSepolia.id]: "0x..." as Address,
    [bscTestnet.id]: "0x..." as Address,
    [sepolia.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,
    [optimismSepolia.id]: "0x..." as Address,
    [polygonAmoy.id]: "0x..." as Address,
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
