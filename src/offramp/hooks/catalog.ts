import { useMemo } from 'react';
import { getPaymentMethodsCatalog } from '@zkp2p/sdk';

export function usePaymentMethodsCatalog(
  chainId: number = 8453,
  env: 'production' | 'staging' = 'production',
) {
  return useMemo(() => {
    try {
      const catalog = getPaymentMethodsCatalog(chainId, env);
      return { data: catalog, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }, [chainId, env]);
}
