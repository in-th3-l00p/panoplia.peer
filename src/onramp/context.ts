import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import React from 'react';
import type { PeerOnrampConfig, PeerExtensionState } from '../types';
import { createOnrampStrategy, type OnrampStrategyInterface } from './strategies';

type OnrampContextValue = {
  strategy: OnrampStrategyInterface;
  connectionState: PeerExtensionState | null;
  isCheckingState: boolean;
  isExtensionAvailable: boolean;
  refreshState: () => Promise<void>;
  config: PeerOnrampConfig;
};

const OnrampContext = createContext<OnrampContextValue | null>(null);

export type PeerOnrampProviderProps = PeerOnrampConfig & {
  children: ReactNode;
};

export function PeerOnrampProvider({
  children,
  strategy: strategyProp = 'auto',
  referrer,
  referrerLogo,
  callbackUrl,
  redirectBaseUrl,
  openExternalUrl,
}: PeerOnrampProviderProps) {
  const [connectionState, setConnectionState] = useState<PeerExtensionState | null>(null);
  const [isCheckingState, setIsCheckingState] = useState(true);

  const strategyInstance = useMemo(
    () =>
      createOnrampStrategy(strategyProp, {
        referrer,
        referrerLogo,
        callbackUrl,
        redirectBaseUrl,
        openExternalUrl,
      }),
    [strategyProp, referrer, referrerLogo, callbackUrl, redirectBaseUrl, openExternalUrl],
  );

  const refreshState = useCallback(async () => {
    setIsCheckingState(true);
    try {
      const state = await strategyInstance.getState();
      setConnectionState(state);
    } catch {
      setConnectionState(null);
    } finally {
      setIsCheckingState(false);
    }
  }, [strategyInstance]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const config = useMemo<PeerOnrampConfig>(
    () => ({
      strategy: strategyProp,
      referrer,
      referrerLogo,
      callbackUrl,
      redirectBaseUrl,
      openExternalUrl,
    }),
    [strategyProp, referrer, referrerLogo, callbackUrl, redirectBaseUrl, openExternalUrl],
  );

  const value = useMemo<OnrampContextValue>(
    () => ({
      strategy: strategyInstance,
      connectionState,
      isCheckingState,
      isExtensionAvailable: strategyInstance.isAvailable(),
      refreshState,
      config,
    }),
    [strategyInstance, connectionState, isCheckingState, refreshState, config],
  );

  return React.createElement(OnrampContext.Provider, { value }, children);
}

export function useOnrampContext(): OnrampContextValue {
  const context = useContext(OnrampContext);
  if (!context) {
    throw new Error('useOnrampContext must be used within a <PeerOnrampProvider>');
  }
  return context;
}
