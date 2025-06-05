import { Address } from "viem";
import { arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, Chain, optimismSepolia, polygonAmoy, sepolia } from "viem/chains";
import NativeBridgeABI from "@/constants/contracts/ccip-eth-sepolia.json";

// Thêm Sei network config
const seiTestnet = {
  id: 1328,
  name: 'Sei Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.sei.io'] },
    public: { http: ['https://rpc-testnet.sei.io'] },
  },
  blockExplorers: {
    default: { name: 'Sei Explorer', url: 'https://testnet.sei.io/explorer' },
  },
  testnet: true,
} as const;

export declare type Token = {
  /** The token's symbol that will be shown in the UI  */
  symbol: string;
  /** The token's address, represented as a mapping by chainId */
  address: AddressMap;
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
    [chainId: number]: string | undefined;
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
      [arbitrumSepolia.id]: undefined,
      [avalancheFuji.id]: undefined,
      [baseSepolia.id]: undefined,
      [bscTestnet.id]: undefined,
      [optimismSepolia.id]: undefined,
      [polygonAmoy.id]: undefined,
      [sepolia.id]: undefined,
      [seiTestnet.id]: undefined,
    },
    decimals: 18,
    logoURL: "/images/eth.avif",
    tags: ["native", "default"],
  },
  {
    symbol: "CCIP-BnM",
    address: {
      [arbitrumSepolia.id]: "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D",
      [avalancheFuji.id]: "0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4",
      [baseSepolia.id]: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
      [bscTestnet.id]: "0xbFA2ACd33ED6EEc0ed3Cc06bF1ac38d22b36B9e9",
      [optimismSepolia.id]: "0x8aF4204e30565DF93352fE8E1De78925F6664dA7",
      [polygonAmoy.id]: "0xcab0EF91Bee323d1A617c0a027eE753aFd6997E4",
      [sepolia.id]: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05",
    },
    decimals: 18,
    logoURL: "/images/eth.avif",
    tags: ["chainlink", "default"],
  },
  {
    symbol: "CCIP-LnM",
    address: {
      [arbitrumSepolia.id]: "0x139E99f0ab4084E14e6bb7DacA289a91a2d92927",
      [avalancheFuji.id]: "0x70F5c5C40b873EA597776DA2C21929A8282A3b35",
      [baseSepolia.id]: "0xA98FA8A008371b9408195e52734b1768c0d1Cb5c",
      [bscTestnet.id]: "0x79a4Fc27f69323660f5Bfc12dEe21c3cC14f5901",
      [optimismSepolia.id]: "0x044a6B4b561af69D2319A2f4be5Ec327a6975D0a",
      [polygonAmoy.id]: "0x3d357fb52253e86c8Ee0f80F5FfE438fD9503FF2",
      [sepolia.id]: "0x466D489b6d36E7E3b824ef491C225F5830E81cC1",
    },
    decimals: 18,
    logoURL: "/images/eth.avif",
    tags: ["chainlink", "default"],
  },
  {
    symbol: "GHO",
    address: {
      [arbitrumSepolia.id]: "0xb13Cfa6f8B2Eed2C37fB00fF0c1A59807C585810",
      [avalancheFuji.id]: "0x9c04928Cc678776eC1C1C0E46ecC03a5F47A7723",
      [baseSepolia.id]: "0x7CFa3f3d1cded0Da930881c609D4Dbf0012c14Bb",
      [bscTestnet.id]: undefined,
      [optimismSepolia.id]: undefined,
      [polygonAmoy.id]: undefined,
      [sepolia.id]: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
    },
    decimals: 18,
    logoURL: "/images/gho.avif",
    tags: ["stablecoin", "default"],
  },
  {
    symbol: "USDC",
    address: {
      [arbitrumSepolia.id]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      [avalancheFuji.id]: "0x5425890298aed601595a70AB815c96711a31Bc65",
      [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      [bscTestnet.id]: undefined,
      [optimismSepolia.id]: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      [polygonAmoy.id]: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      [sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    },
    decimals: 6,
    logoURL: "/images/usdc.avif",
    tags: ["stablecoin", "default"],
  },
];

const chains = [
  {
    chain: arbitrumSepolia,
    logoURL: "/svg/arbitrum.svg",
  },
  {
    chain: avalancheFuji,
    logoURL: "/svg/avalanche.svg",
  },
  {
    chain: baseSepolia,
    logoURL: "/svg/base.svg",
  },
  {
    chain: bscTestnet,
    logoURL: "/svg/bsc.svg"
  },
  {
    chain: sepolia,
    logoURL: "/svg/ethereum.svg"
  },
  {
    chain: optimismSepolia,
    logoURL: "/svg/optimism.svg"
  },
  {
    chain: polygonAmoy,
    logoURL: "/svg/polygon.svg"
  },
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

const chainSelectors = {
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
    [sepolia.id]: "0x471924070aC33f9b9173D45696Cd470C0ab6F228" as Address,
    [optimismSepolia.id]: "0x..." as Address,
    [polygonAmoy.id]: "0x..." as Address,
    [seiTestnet.id]: "sei1wxy0plgymm6kka3lgnez67wu8pj47qqqc74l0fdgu74vxan2ykrszawfdx" as Address,
  },
  receiver: {
    [arbitrumSepolia.id]: "0x..." as Address,
    [avalancheFuji.id]: "0x..." as Address,
    [baseSepolia.id]: "0x..." as Address,
    [bscTestnet.id]: "0x..." as Address,
    [sepolia.id]: "0x471924070aC33f9b9173D45696Cd470C0ab6F228" as Address,
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
