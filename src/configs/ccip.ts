import { Address } from 'viem';

export const CCIP_CHAINS = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    router: "0xE561d5E02207fb5eB32cca20a699E0d8919a1476" as Address,
    linkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA" as Address,
    icon: "/images/chains/ethereum.png",
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    router: "0x70499c328e1E2a3c41108bd3730F6670a44595D1" as Address,
    linkToken: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39" as Address,
    icon: "/images/chains/polygon.png",
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  },
  avalanche: {
    name: "Avalanche",
    chainId: 43114,
    router: "0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8" as Address,
    linkToken: "0x5947BB275c521040051D82396192181b413227A3" as Address,
    icon: "/images/chains/avalanche.png",
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL,
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    router: "0x88E492127709447A5ABEFdaB8788a15B4567589E" as Address,
    linkToken: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" as Address,
    icon: "/images/chains/arbitrum.png",
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL,
  },
} as const;

export const SUPPORTED_TOKENS = {
  link: {
    name: "LINK",
    symbol: "LINK",
    decimals: 18,
    icon: "/images/tokens/link.png",
  },
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    icon: "/images/tokens/usdc.png",
  },
  weth: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    icon: "/images/tokens/weth.png",
  },
} as const;

export const CCIP_ROUTER_ABI = [
  "function sendMessage(uint64 destinationChainSelector, bytes message, address receiver) external payable returns (bytes32 messageId)",
  "function getFee(uint64 destinationChainSelector, bytes message) external view returns (uint256 fee)",
  "function ccipReceive(Client.Any2EVMMessage calldata message) external",
] as const;

export const LINK_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
] as const; 