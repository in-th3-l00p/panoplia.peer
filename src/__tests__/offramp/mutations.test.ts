import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { PeerOfframpProvider } from '../../offramp/context';
import {
  useCreateDeposit,
  useAddFunds,
  useRemoveFunds,
  useWithdrawDeposit,
  useSetAcceptingIntents,
  useSetIntentRange,
  useSetCurrencyMinRate,
} from '../../offramp/hooks/mutations';

const MOCK_TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const;

const mockClient = {
  createDeposit: vi.fn(),
  addFunds: vi.fn(),
  removeFunds: vi.fn(),
  withdrawDeposit: vi.fn(),
  setAcceptingIntents: vi.fn(),
  setIntentRange: vi.fn(),
  setCurrencyMinRate: vi.fn(),
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

describe('mutation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCreateDeposit', () => {
    it('returns initial state', async () => {
      const { result } = renderHook(() => useCreateDeposit(), {
        wrapper: createWrapper(),
      });

      // Wait for client to initialize
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.error).toBeNull();
      expect(result.current.txHash).toBeNull();
    });

    it('calls client.createDeposit and sets txHash on success', async () => {
      mockClient.createDeposit.mockResolvedValue({
        hash: MOCK_TX_HASH,
        depositDetails: [],
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useCreateDeposit({ onSuccess }), {
        wrapper: createWrapper(),
      });

      // Wait for the client to be available
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.mutate({} as any);
      });

      expect(mockClient.createDeposit).toHaveBeenCalled();
      expect(result.current.txHash).toBe(MOCK_TX_HASH);
      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('sets error on failure', async () => {
      mockClient.createDeposit.mockRejectedValue(new Error('TX failed'));

      const onError = vi.fn();
      const { result } = renderHook(() => useCreateDeposit({ onError }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.mutate({} as any);
      });

      expect(result.current.error?.message).toBe('TX failed');
      expect(result.current.txHash).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('errors when client is null', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useCreateDeposit({ onError }), {
        wrapper: createWrapper(null),
      });

      await act(async () => {
        await result.current.mutate({} as any);
      });

      expect(result.current.error?.message).toContain('not initialized');
      expect(onError).toHaveBeenCalled();
    });

    it('reset clears state', async () => {
      mockClient.createDeposit.mockRejectedValue(new Error('TX failed'));

      const { result } = renderHook(() => useCreateDeposit(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.mutate({} as any);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.txHash).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe.each([
    ['useAddFunds', useAddFunds, 'addFunds', { depositId: 1n, amount: 100n }],
    ['useRemoveFunds', useRemoveFunds, 'removeFunds', { depositId: 1n, amount: 50n }],
    ['useWithdrawDeposit', useWithdrawDeposit, 'withdrawDeposit', { depositId: 1n }],
    [
      'useSetAcceptingIntents',
      useSetAcceptingIntents,
      'setAcceptingIntents',
      { depositId: 1n, accepting: true },
    ],
    [
      'useSetIntentRange',
      useSetIntentRange,
      'setIntentRange',
      { depositId: 1n, min: 10n, max: 1000n },
    ],
    [
      'useSetCurrencyMinRate',
      useSetCurrencyMinRate,
      'setCurrencyMinRate',
      {
        depositId: 1n,
        paymentMethod: '0x1234' as `0x${string}`,
        fiatCurrency: '0x5678' as `0x${string}`,
        minConversionRate: 100n,
      },
    ],
  ])('%s', (_name, hook, methodName, params) => {
    it('calls the correct client method and returns txHash', async () => {
      (mockClient as any)[methodName].mockResolvedValue(MOCK_TX_HASH);

      const { result } = renderHook(() => (hook as any)(), {
        wrapper: createWrapper(),
      });

      // Wait for client to be ready
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.mutate(params);
      });

      expect((mockClient as any)[methodName]).toHaveBeenCalledWith(params);
      expect(result.current.txHash).toBe(MOCK_TX_HASH);
      expect(result.current.error).toBeNull();
    });

    it('handles errors', async () => {
      (mockClient as any)[methodName].mockRejectedValue(new Error('Reverted'));

      const { result } = renderHook(() => (hook as any)(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.mutate(params);
      });

      expect(result.current.error?.message).toBe('Reverted');
      expect(result.current.txHash).toBeNull();
    });

    it('errors when client is null', async () => {
      const { result } = renderHook(() => (hook as any)(), {
        wrapper: createWrapper(null),
      });

      await act(async () => {
        await result.current.mutate(params);
      });

      expect(result.current.error?.message).toContain('not initialized');
    });
  });
});
