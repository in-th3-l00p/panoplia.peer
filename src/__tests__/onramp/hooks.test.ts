import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { PeerOnrampProvider } from '../../onramp/context';
import {
  useOnrampState,
  useOnrampConnection,
  useOnramp,
  useOnrampProof,
} from '../../onramp/hooks';

// Mock the SDK
vi.mock('@zkp2p/sdk', () => ({
  peerExtensionSdk: {
    getState: vi.fn().mockResolvedValue('ready'),
    isAvailable: vi.fn().mockReturnValue(true),
    requestConnection: vi.fn().mockResolvedValue(true),
    openInstallPage: vi.fn(),
    onramp: vi.fn(),
    onProofComplete: vi.fn().mockReturnValue(() => {}),
  },
}));

import { peerExtensionSdk } from '@zkp2p/sdk';

function createWrapper(props?: Record<string, any>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      PeerOnrampProvider,
      {
        referrer: 'TestApp',
        strategy: 'extension' as const,
        ...props,
      },
      children,
    );
  };
}

describe('useOnrampState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('ready');
    vi.mocked(peerExtensionSdk.isAvailable).mockReturnValue(true);
  });

  it('returns initial checking state then resolves', async () => {
    const { result } = renderHook(() => useOnrampState(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isCheckingState).toBe(false);
    });

    expect(result.current.connectionState).toBe('ready');
    expect(result.current.activeStrategy).toBe('extension');
    expect(result.current.isExtensionAvailable).toBe(true);
  });

  it('refreshState re-fetches the state', async () => {
    const { result } = renderHook(() => useOnrampState(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isCheckingState).toBe(false);
    });

    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('needs_connection');

    await act(async () => {
      await result.current.refreshState();
    });

    expect(result.current.connectionState).toBe('needs_connection');
  });

  it('handles getState failure gracefully', async () => {
    vi.mocked(peerExtensionSdk.getState).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useOnrampState(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isCheckingState).toBe(false);
    });

    expect(result.current.connectionState).toBeNull();
  });
});

describe('useOnrampConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('needs_connection');
    vi.mocked(peerExtensionSdk.requestConnection).mockResolvedValue(true);
  });

  it('requestConnection delegates to strategy and refreshes state', async () => {
    const { result } = renderHook(() => useOnrampConnection(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('needs_connection');
    });

    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('ready');

    let connected: boolean | undefined;
    await act(async () => {
      connected = await result.current.requestConnection();
    });

    expect(connected).toBe(true);
    expect(peerExtensionSdk.requestConnection).toHaveBeenCalled();
  });

  it('openInstallPage delegates to strategy', async () => {
    const { result } = renderHook(() => useOnrampConnection(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('needs_connection');
    });

    act(() => {
      result.current.openInstallPage();
    });

    expect(peerExtensionSdk.openInstallPage).toHaveBeenCalled();
  });
});

describe('useOnramp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('ready');
    vi.mocked(peerExtensionSdk.isAvailable).mockReturnValue(true);
  });

  it('isReady reflects connectionState', async () => {
    const { result } = renderHook(() => useOnramp(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.connectionState).toBe('ready');
  });

  it('onramp merges provider config with params', async () => {
    const { result } = renderHook(() => useOnramp(), {
      wrapper: createWrapper({ referrer: 'MergedApp', callbackUrl: 'https://cb.example.com' }),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.onramp({ inputCurrency: 'USD', inputAmount: 25 });
    });

    expect(peerExtensionSdk.onramp).toHaveBeenCalledWith(
      expect.objectContaining({
        referrer: 'MergedApp',
        callbackUrl: 'https://cb.example.com',
        inputCurrency: 'USD',
        inputAmount: 25,
      }),
    );
  });

  it('buildRedirectUrl returns a valid URL', async () => {
    const { result } = renderHook(() => useOnramp(), {
      wrapper: createWrapper({ referrer: 'URLApp' }),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    const url = result.current.buildRedirectUrl({ inputCurrency: 'EUR' });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('referrer')).toBe('URLApp');
    expect(parsed.searchParams.get('inputCurrency')).toBe('EUR');
  });
});

describe('useOnrampProof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(peerExtensionSdk.getState).mockResolvedValue('ready');
  });

  it('subscribes to proof events and unsubscribes on unmount', async () => {
    const unsub = vi.fn();
    vi.mocked(peerExtensionSdk.onProofComplete).mockReturnValue(unsub);

    const callback = vi.fn();
    const { unmount } = renderHook(() => useOnrampProof(callback), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(peerExtensionSdk.onProofComplete).toHaveBeenCalledWith(callback);
    });

    unmount();
    expect(unsub).toHaveBeenCalled();
  });
});

describe('hooks outside provider', () => {
  it('useOnrampState throws without provider', () => {
    expect(() => renderHook(() => useOnrampState())).toThrow(
      'useOnrampContext must be used within a <PeerOnrampProvider>',
    );
  });

  it('useOnrampConnection throws without provider', () => {
    expect(() => renderHook(() => useOnrampConnection())).toThrow(
      'useOnrampContext must be used within a <PeerOnrampProvider>',
    );
  });

  it('useOnramp throws without provider', () => {
    expect(() => renderHook(() => useOnramp())).toThrow(
      'useOnrampContext must be used within a <PeerOnrampProvider>',
    );
  });
});
