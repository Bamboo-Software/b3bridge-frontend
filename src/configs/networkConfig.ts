import { Address } from "viem";
import { Chain } from "viem/chains";
import NativeBridgeABI from "@/constants/contracts/ccip-eth-sepolia.json";
import B3BridgeDest from "@/constants/contracts/ccip-sei-testnet.json";
export const ethChain = {
  id: Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID),
  name: "Ethereum",
  network: "ethereum",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL!],
      wss: [process.env.NEXT_PUBLIC_ETH_CHAIN_WS_URL!],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL!],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  testnet: true,
};

export const seiChain = {
  id: Number(process.env.NEXT_PUBLIC_SEI_CHAIN_ID),
  name: "Sei",
  network: "sei",
  nativeCurrency: {
    name: "Sei",
    symbol: "SEI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_SEI_CHAIN_RPC_URL!],
      wss: [process.env.NEXT_PUBLIC_SEI_CHAIN_WS_URL!],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_SEI_CHAIN_WS_URL!],
    },
  },
  blockExplorers: {
    default: {
      name: "Sei Explorer",
      url: "https://sei.explorers.guru",
    },
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
  // /** Addresses for the LINK token contract on the corresponding chains */
  // linkContracts: AddressMap;
  // /** Addresses for the router contracts on the corresponding chains */
  // routerAddresses: AddressMap;
  /** Selectors for the chains that should be supported */
  chainSelectors: {
    [chainId: number]: string;
  };
  /** CCIP contracts for separate token transfers */
  // ccipContracts: {
  //   sender: AddressMap;
  //   receiver: AddressMap;
  // };
};

export const tokensList: Token[] = [
  {
    symbol: "ETH",
    address: {
      [ethChain.id]: undefined, // native
    },
    decimals: 18,
    logoURL: "/images/eth.avif",
    tags: ["native", "default"],
  },
  {
    symbol: "USDC",
    address: {
      [ethChain.id]: process.env.NEXT_PUBLIC_ETH_USDC_ADDRESS! as `0x${string}`,
    },
    decimals: 6,
    logoURL: "/images/usdc.avif",
    tags: ["stablecoin", "default"],
  },
  {
    symbol: "wUSDC",
    wrappedFrom: "USDC",
    address: {
      [seiChain.id]: process.env.NEXT_PUBLIC_SEI_WUSDC_ADDRESS! as `0x${string}`,
    },
    decimals: 6,
    logoURL: "/images/usdc.avif",
    tags: ["wrapped", "stablecoin"],
  },
  {
    symbol: "wETH",
    wrappedFrom: "ETH",
    address: {
      [seiChain.id]: process.env.NEXT_PUBLIC_SEI_WETH_ADDRESS! as `0x${string}`,
    },
    decimals: 6,
    logoURL: "/images/eth.avif",
    tags: ["wrapped", "default"],
  },
];

const chains = [
  {
    chain: ethChain,
    logoURL: "/svg/ethereum.svg"
  },
  {
    chain: seiChain,
    logoURL: "/svg/sei.svg"
  },
];

// const linkContracts: AddressMap = {
//   [ethChain.id]: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
//   [seiChain.id]: "0x..." as Address,
// };

// const routerAddresses: AddressMap = {
//   [ethChain.id]: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
//   [seiChain.id]: "0x59F5222c5d77f8D3F56e34Ff7E75A05d2cF3a98A",
// };

export const chainSelectors: Record<number, string> = {
  [ethChain.id]: process.env.NEXT_PUBLIC_ETH_SELECTOR!,
  [seiChain.id]:  process.env.NEXT_PUBLIC_SEI_SELECTOR!,
};

// const ccipContracts = {
//   sender: {
//     [ethChain.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,
//     [seiChain.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
//   },
//   receiver: {

//     [ethChain.id]: "0x29a9fABe9138f2A228782FA58943f7c5E1936089" as Address,

//     [seiChain.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
//   },
// };

export const networkConfig: NetworkConfig = {
  chains,
  // linkContracts,
  // routerAddresses,
  chainSelectors,
  tokensList,
  // ccipContracts,
};

// Import the ABI
export const ETH_BRIDGE_ABI = NativeBridgeABI;
export const SEI_BRIDGE_ABI = B3BridgeDest;
