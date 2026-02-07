import type { ChainId } from '../types';

export const SUPPORTED_CHAIN_IDS: Record<string, ChainId> = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  SCROLL_MAINNET: 534352,
  HARDHAT: 31337,
} as const;

export function formatTokenAddress(address: string): `0x${string}` {
  const clean = address.toLowerCase().trim();
  if (!clean.startsWith('0x')) {
    return `0x${clean}` as `0x${string}`;
  }
  return clean as `0x${string}`;
}
