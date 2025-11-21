import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";

// Environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const CHAIN_SYMBOL = process.env.NEXT_PUBLIC_CHAIN_SYMBOL;
const BLOCK_EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK;
const BLOCK_EXPLORER_NAME = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_NAME;

// Define your custom chain based on environment variables
const customChain = {
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: {
    name: CHAIN_SYMBOL,
    symbol: CHAIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: BLOCK_EXPLORER
    ? {
        default: {
          name: BLOCK_EXPLORER_NAME,
          url: BLOCK_EXPLORER,
        },
      }
    : undefined,
  testnet: NETWORK_NAME !== "mainnet",
};

// Create wagmi config using RainbowKit's getDefaultConfig for v2
export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_PLATFORM_NAME || "LinkTum Matrix",
  projectId: PROJECT_ID,
  chains: [customChain],
  transports: {
    [customChain.id]: http(RPC_URL),
  },
});

export const chains = [customChain];
