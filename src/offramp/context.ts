import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import React from 'react';
import { OfframpClient } from '@zkp2p/sdk';
import type { PeerOfframpConfig, OfframpClientState } from '../types';

type OfframpContextValue = OfframpClientState & {
  config: PeerOfframpConfig;
};

const OfframpContext = createContext<OfframpContextValue | null>(null);

export type PeerOfframpProviderProps = PeerOfframpConfig & {
  children: ReactNode;
};

export function PeerOfframpProvider({
  children,
  walletClient,
  chainId,
  apiKey,
}: PeerOfframpProviderProps) {
  const [client, setClient] = useState<OfframpClient | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (!walletClient) {
      setClient(null);
      setInitError(null);
      return;
    }

    try {
      const offrampClient = new OfframpClient({
        walletClient,
        chainId,
        apiKey,
      });
      setClient(offrampClient);
      setInitError(null);
    } catch (err) {
      setClient(null);
      setInitError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [walletClient, chainId, apiKey]);

  const config = useMemo<PeerOfframpConfig>(
    () => ({ walletClient, chainId, apiKey }),
    [walletClient, chainId, apiKey],
  );

  const value = useMemo<OfframpContextValue>(
    () => ({
      client,
      isReady: client !== null,
      initError,
      config,
    }),
    [client, initError, config],
  );

  return React.createElement(OfframpContext.Provider, { value }, children);
}

export function useOfframpContext(): OfframpContextValue {
  const context = useContext(OfframpContext);
  if (!context) {
    throw new Error('useOfframpContext must be used within a <PeerOfframpProvider>');
  }
  return context;
}

export function useOfframpClient(): OfframpClientState {
  const { client, isReady, initError } = useOfframpContext();
  return useMemo(() => ({ client, isReady, initError }), [client, isReady, initError]);
}
