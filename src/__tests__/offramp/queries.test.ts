import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { PeerOfframpProvider } from '../../offramp/context';
import {
  useDeposits,
  useDeposit,
  useIntents,
  useIntent,
} from '../../offramp/hooks/queries';

const mockDeposits = [
  { depositId: 1n, amount: 100n },
  { depositId: 2n, amount: 200n },
];
const mockDeposit = { depositId: 1n, amount: 100n };
const mockIntents = [{ intentHash: '0xabc' }, { intentHash: '0xdef' }];
const mockIntent = { intentHash: '0xabc' };

const mockClient = {
  getDeposits: vi.fn(),
  getAccountDeposits: vi.fn(),
  getDeposit: vi.fn(),
  getIntents: vi.fn(),
  getAccountIntents: vi.fn(),
  getIntent: vi.fn(),
};

vi.mock('@zkp2p/sdk', () => ({
  OfframpClient: vi.fn().mockImplementation(function () {
    return mockClient;
  }),
  getPaymentMethodsCatalog: vi.fn().mockReturnValue({ paymentMethods: [] }),
}));

function createWrapper(walletClient: any = { account: { address: '0x1234' } }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      PeerOfframpProvider,
      { walletClient, chainId: 8453 },
      children,
    );
  };
}

describe('query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.getDeposits.mockResolvedValue(mockDeposits);
    mockClient.getAccountDeposits.mockResolvedValue([mockDeposits[0]]);
    mockClient.getDeposit.mockResolvedValue(mockDeposit);
    mockClient.getIntents.mockResolvedValue(mockIntents);
    mockClient.getAccountIntents.mockResolvedValue([mockIntents[0]]);
    mockClient.getIntent.mockResolvedValue(mockIntent);
  });

  describe('useDeposits', () => {
    it('fetches all deposits when no address provided', async () => {
      const { result } = renderHook(() => useDeposits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDeposits);
      });

      expect(mockClient.getDeposits).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('fetches account deposits when address provided', async () => {
      const addr = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`;
      const { result } = renderHook(() => useDeposits(addr), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([mockDeposits[0]]);
      });

      expect(mockClient.getAccountDeposits).toHaveBeenCalledWith(addr);
    });

    it('returns null when client is null', async () => {
      const { result } = renderHook(() => useDeposits(), {
        wrapper: createWrapper(null),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
    });

    it('refetch re-fetches data', async () => {
      const { result } = renderHook(() => useDeposits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDeposits);
      });

      const newDeposits = [{ depositId: 3n, amount: 300n }];
      mockClient.getDeposits.mockResolvedValue(newDeposits);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual(newDeposits);
    });

    it('sets error on fetch failure', async () => {
      mockClient.getDeposits.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeposits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('useDeposit', () => {
    it('fetches a single deposit by id', async () => {
      const { result } = renderHook(() => useDeposit(1n), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDeposit);
      });

      expect(mockClient.getDeposit).toHaveBeenCalledWith(1n);
    });

    it('returns null when depositId is undefined', async () => {
      const { result } = renderHook(() => useDeposit(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(mockClient.getDeposit).not.toHaveBeenCalled();
    });
  });

  describe('useIntents', () => {
    it('fetches all intents when no address provided', async () => {
      const { result } = renderHook(() => useIntents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockIntents);
      });

      expect(mockClient.getIntents).toHaveBeenCalled();
    });

    it('fetches account intents when address provided', async () => {
      const addr = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`;
      const { result } = renderHook(() => useIntents(addr), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });

      expect(mockClient.getAccountIntents).toHaveBeenCalledWith(addr);
    });
  });

  describe('useIntent', () => {
    it('fetches a single intent by hash', async () => {
      const hash = '0xabc' as `0x${string}`;
      const { result } = renderHook(() => useIntent(hash), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockIntent);
      });

      expect(mockClient.getIntent).toHaveBeenCalledWith(hash);
    });

    it('returns null when intentHash is undefined', async () => {
      const { result } = renderHook(() => useIntent(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(mockClient.getIntent).not.toHaveBeenCalled();
    });
  });
});
