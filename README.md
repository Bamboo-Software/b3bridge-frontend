# B3Bridge Frontend

A modern cross-chain bridge application built with Next.js 14, enabling seamless token transfers between Ethereum and Sei networks using Chainlink CCIP (Cross-Chain Interoperability Protocol).

## 📋 Overview

B3Bridge Frontend is a decentralized application (dApp) that provides a user-friendly interface for bridging tokens between different blockchain networks. The application leverages Chainlink's CCIP infrastructure to ensure secure and reliable cross-chain transfers.

### Key Features

- **Cross-Chain Bridging**: Transfer tokens between Ethereum and Sei networks
- **Multi-Token Support**: Bridge ETH, USDC, and wrapped tokens (wETH, wUSDC)
- **Real-time Monitoring**: Track bridge transactions and status updates
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Responsive Design**: Modern UI with dark theme and smooth animations
- **Transaction History**: View past bridge transactions and their status
- **3D Visuals**: Interactive WebGL components for enhanced user experience

### Supported Networks

- **Ethereum** (Sepolia Testnet)
- **Sei** (Atlantic Testnet)

### Supported Tokens

- **ETH** (Native Ethereum)
- **USDC** (USD Coin)
- **wETH** (Wrapped Ethereum on Sei)
- **wUSDC** (Wrapped USDC on Sei)

## 🏗️ Project Structure

```
b3bridge-frontend/
├── public/                          # Static assets
│   ├── images/                      # Token logos and images
│   ├── svg/                         # Network and wallet icons
│   └── animations/                  # Animation files
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── (website)/              # Website layout group
│   │   │   ├── bridge/             # Bridge page
│   │   │   ├── pool/               # Pool page
│   │   │   ├── swap/               # Swap page
│   │   │   └── layout.tsx          # Website layout
│   │   ├── globals.css             # Global styles
│   │   └── layout.tsx              # Root layout
│   ├── components/                  # React components
│   │   ├── Modal/                  # Modal components
│   │   │   ├── ConnectWalletModal/ # Wallet connection modal
│   │   │   └── ToastBridged/       # Bridge notification toast
│   │   ├── PublicLayout/           # Layout components
│   │   │   ├── Header/             # Navigation header
│   │   │   ├── Footer/             # Footer component
│   │   │   └── Layout/             # Main layout wrapper
│   │   ├── WalletMenu/             # Wallet menu component
│   │   ├── pages/                  # Page-specific components
│   │   │   ├── Bridge/             # Bridge page components
│   │   │   │   ├── BridgeTab/      # Bridge transaction form
│   │   │   │   └── HistoryTab/     # Transaction history
│   │   │   ├── Home/               # Home page components
│   │   │   ├── Pool/               # Liquidity pool components
│   │   │   └── Swap/               # Token swap components
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx          # Button component
│   │   │   ├── input.tsx           # Input component
│   │   │   ├── select.tsx          # Select dropdown
│   │   │   └── ...                 # Other UI components
│   │   └── webgl/                  # 3D WebGL components
│   │       └── Canvas/             # Three.js canvas components
│   ├── configs/                     # Configuration files
│   │   ├── ccip.ts                 # CCIP protocol configuration
│   │   ├── contracts.ts            # Smart contract addresses
│   │   ├── networkConfig.ts        # Network and token configuration
│   │   └── wagmi.tsx               # Wagmi Web3 configuration
│   ├── constants/                   # Application constants
│   │   ├── contracts/              # Contract ABIs
│   │   │   ├── ccip-eth-sepolia.json
│   │   │   └── ccip-sei-testnet.json
│   │   └── index.ts                # General constants
│   ├── hooks/                       # Custom React hooks
│   │   ├── useCCIPBridge.ts        # Bridge operation hooks
│   │   ├── useWallet.ts            # Wallet connection hooks
│   │   ├── usePollMintTokenCCIP.ts # Token minting polling
│   │   ├── usePollUnlockTokenCCIP.ts # Token unlock polling
│   │   └── ...                     # Other custom hooks
│   ├── provider/                    # React context providers
│   │   ├── auth-provider/          # Authentication provider
│   │   ├── react-query-client-provider/ # React Query provider
│   │   ├── theme-provider/         # Theme management provider
│   │   └── wagmi-provider/         # Wagmi Web3 provider
│   ├── store/                       # State management (Zustand)
│   │   ├── useBridgeStatusStore.ts # Bridge status state
│   │   ├── useModalStore.ts        # Modal visibility state
│   │   └── store.ts                # Main store configuration
│   ├── types/                       # TypeScript type definitions
│   ├── utils/                       # Utility functions
│   └── styles/                      # Additional styles
├── .env.example                     # Environment variables template
├── components.json                  # Shadcn/ui configuration
├── next.config.mjs                 # Next.js configuration
├── package.json                     # Dependencies and scripts
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── Dockerfile                      # Docker configuration
```

## 🔧 Environment Variables

The application requires several environment variables to be configured. Copy `.env.example` to `.env.local` and fill in the values:

### Ethereum Network Configuration

```bash
# Chain ID for Ethereum Sepolia
NEXT_PUBLIC_ETH_CHAIN_ID=11155111

# Chain information
NEXT_PUBLIC_ETH_CHAIN_NAME="Ethereum Sepolia"
NEXT_PUBLIC_ETH_NETWORK_LABEL="Ethereum"
NEXT_PUBLIC_ETH_TESTNET=true

# RPC & WebSocket URLs
NEXT_PUBLIC_ETH_CHAIN_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
NEXT_PUBLIC_ETH_CHAIN_WS_URL="wss://sepolia.infura.io/ws/v3/YOUR_INFURA_KEY"

# Contract addresses
NEXT_PUBLIC_ETH_BRIDGE_CONTRACT="0x..."
NEXT_PUBLIC_ETH_USDC_ADDRESS="0x..."

# CCIP Configuration
NEXT_PUBLIC_ETH_SELECTOR="16015286601757825753"

# Block explorer
NEXT_PUBLIC_TX_ETH="https://sepolia.etherscan.io"
```

### Sei Network Configuration

```bash
# Chain ID for Sei Testnet
NEXT_PUBLIC_SEI_CHAIN_ID=1328

# Chain information
NEXT_PUBLIC_SEI_CHAIN_NAME="Sei Testnet"
NEXT_PUBLIC_SEI_NETWORK_LABEL="Sei"
NEXT_PUBLIC_SEI_TESTNET=true

# RPC & WebSocket URLs
NEXT_PUBLIC_SEI_CHAIN_RPC_URL="https://evm-rpc-testnet.sei-apis.com"
NEXT_PUBLIC_SEI_CHAIN_WS_URL="wss://evm-ws-testnet.sei-apis.com"

# Contract addresses
NEXT_PUBLIC_SEI_BRIDGE_CONTRACT="0x..."
NEXT_PUBLIC_SEI_WUSDC_ADDRESS="0x..."
NEXT_PUBLIC_SEI_WETH_ADDRESS="0x..."

# CCIP Configuration
NEXT_PUBLIC_SEI_SELECTOR="5224473277236331295"

# Block explorers
NEXT_PUBLIC_TX_SEITRACE="https://seitrace.com"
NEXT_PUBLIC_TX_NETWORK="testnet"
```

### Required Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ETH_CHAIN_ID` | Ethereum network chain ID | `11155111` (Sepolia) |
| `NEXT_PUBLIC_SEI_CHAIN_ID` | Sei network chain ID | `1328` (Atlantic Testnet) |
| `NEXT_PUBLIC_ETH_CHAIN_RPC_URL` | Ethereum RPC endpoint | Infura/Alchemy URL |
| `NEXT_PUBLIC_SEI_CHAIN_RPC_URL` | Sei RPC endpoint | Sei official RPC |
| `NEXT_PUBLIC_ETH_BRIDGE_CONTRACT` | Ethereum bridge contract address | Smart contract address |
| `NEXT_PUBLIC_SEI_BRIDGE_CONTRACT` | Sei bridge contract address | Smart contract address |
| `NEXT_PUBLIC_ETH_USDC_ADDRESS` | USDC token address on Ethereum | ERC-20 contract address |
| `NEXT_PUBLIC_SEI_WUSDC_ADDRESS` | Wrapped USDC address on Sei | Token contract address |
| `NEXT_PUBLIC_ETH_SELECTOR` | Chainlink CCIP selector for Ethereum | CCIP network identifier |
| `NEXT_PUBLIC_SEI_SELECTOR` | Chainlink CCIP selector for Sei | CCIP network identifier |

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Git**
- **MetaMask** or compatible Web3 wallet

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd b3bridge-frontend
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using pnpm
   pnpm install
   
   # Using bun
   bun install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit the environment variables
   nano .env.local
   ```

4. **Configure Network Settings**
   - Update the network configurations in `src/configs/networkConfig.ts`
   - Ensure contract addresses match your deployed contracts
   - Verify CCIP selectors for your target networks

5. **Start Development Server**
   ```bash
   # Using npm
   npm run dev
   
   # Using yarn
   yarn dev
   
   # Using pnpm
   pnpm dev
   
   # Using bun
   bun dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Wallet Setup

1. **Install MetaMask**
   - Download and install MetaMask browser extension
   - Create or import your wallet

2. **Add Custom Networks**
   - Add Ethereum Sepolia testnet
   - Add Sei Atlantic testnet
   - Configure network details as per your environment variables

3. **Get Test Tokens**
   - Ethereum Sepolia: Use [Sepolia Faucet](https://sepoliafaucet.com/)
   - Sei Testnet: Use [Sei Faucet](https://faucet.sei.io/)

## 🎯 Usage Guide

### Bridging Tokens

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask or preferred wallet
   - Approve connection

2. **Select Source Network**
   - Choose the network you want to bridge from
   - Ensure you have tokens on the selected network

3. **Select Destination Network**
   - Choose the target network for your tokens
   - The app will automatically show supported tokens

4. **Configure Transfer**
   - Select the token to bridge
   - Enter the amount to transfer
   - Specify recipient address (optional, defaults to your address)

5. **Execute Bridge**
   - Review transaction details
   - Click "Bridge" to initiate transfer
   - Confirm transaction in your wallet

6. **Monitor Progress**
   - Track transaction status in real-time
   - Check the "History" tab for past transactions
   - Receive notifications when bridge completes

### Transaction History

- View all your bridge transactions
- Check transaction status and details
- Click on transaction hashes to view on block explorers
- Monitor pending, completed, and failed transfers

## 📦 Build & Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t b3bridge-frontend .

# Run container
docker run -p 3000:3000 b3bridge-frontend
```

### Environment-Specific Builds

```bash
# Development build
npm run dev

# Production build with static export
npm run build && npm run export

# Linting
npm run lint
```

## 🛠️ Technology Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript 5** - Type-safe JavaScript

### Web3 Integration
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Ethers.js** - Ethereum library for blockchain interaction

### UI/UX
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Re-usable component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### 3D Graphics
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helper components for R3F

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Hook Form** - Form state management

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Sass** - CSS preprocessing

## 🔗 Key Dependencies

```json
{
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "wagmi": "2.12.25",
    "ethers": "^6.14.3",
    "viem": "latest",
    "@tanstack/react-query": "^5.40.1",
    "framer-motion": "^12.12.1",
    "tailwindcss": "^3.4.1",
    "@react-three/fiber": "^8.13.7",
    "@react-three/drei": "9.77.1",
    "three": "0.152.0",
    "zustand": "4.5.2",
    "react-hook-form": "7.51.5"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Ensure responsive design compatibility

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord/Telegram for support

## 🔮 Roadmap

- [ ] Support for additional networks (Polygon, Arbitrum, etc.)
- [ ] Advanced trading features (limit orders, stop-loss)
- [ ] Liquidity mining and yield farming
- [ ] Mobile app development
- [ ] Integration with more wallet providers
- [ ] Advanced analytics and reporting
- [ ] Cross-chain governance features

---

For more information about Next.js, visit the [Next.js Documentation](https://nextjs.org/docs).
For Web3 development resources, check [Ethereum.org](https://ethereum.org/developers/).
