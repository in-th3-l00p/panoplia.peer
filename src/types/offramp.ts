import type { WalletClient, Hash } from 'viem';
import type { OfframpClient } from '@zkp2p/sdk';

export type PeerOfframpConfig = {
  walletClient: WalletClient | null;
  chainId: number;
  apiKey?: string;
};

export type MutationResult<T = Hash> = {
  mutate: (...args: any[]) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

export type MutationWithHashResult = MutationResult<Hash> & {
  txHash: Hash | null;
};

export type MutationOptions = {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
};

export type QueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export type OfframpClientState = {
  client: OfframpClient | null;
  isReady: boolean;
  initError: Error | null;
};

export type { OfframpClient };
