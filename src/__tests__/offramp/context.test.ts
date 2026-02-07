import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { PeerOfframpProvider, useOfframpClient } from '../../offramp/context';

const mockClient = {
  getDeposits: vi.fn(),
  getAccountDeposits: vi.fn(),
  getDeposit: vi.fn(),
  getIntents: vi.fn(),
  getAccountIntents: vi.fn(),
  getIntent: vi.fn(),
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

function createWrapper(props?: Record<string, any>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      PeerOfframpProvider,
      {
        walletClient: null,
        chainId: 8453,
        ...props,
      },
      children,
    );
  };
}

describe('PeerOfframpProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides null client when walletClient is null', async () => {
    const { result } = renderHook(() => useOfframpClient(), {
      wrapper: createWrapper({ walletClient: null }),
    });

    // When walletClient is null, client stays null (no effect to wait for)
    expect(result.current.client).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(result.current.initError).toBeNull();
  });

  it('creates OfframpClient when walletClient is provided', async () => {
    const { OfframpClient } = await import('@zkp2p/sdk');
    const fakeWallet = { account: { address: '0x1234' } };

    const { result } = renderHook(() => useOfframpClient(), {
      wrapper: createWrapper({ walletClient: fakeWallet, chainId: 8453 }),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(OfframpClient).toHaveBeenCalledWith({
      walletClient: fakeWallet,
      chainId: 8453,
      apiKey: undefined,
    });
    expect(result.current.client).toBe(mockClient);
    expect(result.current.initError).toBeNull();
  });

  it('sets initError when OfframpClient constructor throws', async () => {
    const { OfframpClient } = await import('@zkp2p/sdk');
    vi.mocked(OfframpClient).mockImplementationOnce(function () {
      throw new Error('Bad config');
    });

    const fakeWallet = { account: { address: '0x1234' } };
    const { result } = renderHook(() => useOfframpClient(), {
      wrapper: createWrapper({ walletClient: fakeWallet, chainId: 8453 }),
    });

    await waitFor(() => {
      expect(result.current.initError).not.toBeNull();
    });

    expect(result.current.client).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(result.current.initError?.message).toBe('Bad config');
  });

  it('throws when useOfframpClient is called outside provider', () => {
    expect(() => renderHook(() => useOfframpClient())).toThrow(
      'useOfframpContext must be used within a <PeerOfframpProvider>',
    );
  });
});
