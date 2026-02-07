import { useCallback, useEffect, useMemo } from 'react';
import type {
  OnrampConnectionState,
  OnrampConnectionActions,
  OnrampActions,
  OnrampParams,
  OnrampProofCallback,
} from '../types';
import { useOnrampContext } from './context';
import { buildOnrampRedirectUrl } from './url';

export function useOnrampState(): OnrampConnectionState {
  const { connectionState, isCheckingState, strategy, isExtensionAvailable, refreshState } =
    useOnrampContext();

  return useMemo(
    () => ({
      connectionState,
      isCheckingState,
      activeStrategy: strategy.type,
      isExtensionAvailable,
      refreshState,
    }),
    [connectionState, isCheckingState, strategy.type, isExtensionAvailable, refreshState],
  );
}

export function useOnrampConnection(): OnrampConnectionActions {
  const { strategy, connectionState, refreshState } = useOnrampContext();

  const requestConnection = useCallback(async () => {
    const result = await strategy.requestConnection();
    await refreshState();
    return result;
  }, [strategy, refreshState]);

  const openInstallPage = useCallback(() => {
    strategy.openInstallPage();
  }, [strategy]);

  return useMemo(
    () => ({
      connectionState,
      requestConnection,
      openInstallPage,
    }),
    [connectionState, requestConnection, openInstallPage],
  );
}

export function useOnramp(): OnrampActions {
  const { strategy, connectionState, config } = useOnrampContext();

  const onramp = useCallback(
    (params?: OnrampParams) => {
      strategy.onramp({
        referrer: config.referrer,
        referrerLogo: config.referrerLogo,
        callbackUrl: config.callbackUrl,
        ...params,
      });
    },
    [strategy, config],
  );

  const buildUrl = useCallback(
    (params?: OnrampParams) =>
      buildOnrampRedirectUrl(params, {
        baseUrl: config.redirectBaseUrl,
        referrer: config.referrer,
        referrerLogo: config.referrerLogo,
        callbackUrl: config.callbackUrl,
      }),
    [config],
  );

  const isReady = connectionState === 'ready';

  return useMemo(
    () => ({
      onramp,
      buildRedirectUrl: buildUrl,
      connectionState,
      isReady,
    }),
    [onramp, buildUrl, connectionState, isReady],
  );
}

export function useOnrampProof(callback: OnrampProofCallback): void {
  const { strategy } = useOnrampContext();

  useEffect(() => {
    const unsubscribe = strategy.onProofComplete(callback);
    return unsubscribe;
  }, [strategy, callback]);
}
