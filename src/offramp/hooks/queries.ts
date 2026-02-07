import { useState, useEffect, useCallback, useMemo } from 'react';
import type { QueryResult } from '../../types';
import { useOfframpContext } from '../context';

function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return useMemo(
    () => ({ data, isLoading, error, refetch }),
    [data, isLoading, error, refetch],
  );
}

export function useDeposits(address?: `0x${string}`) {
  const { client } = useOfframpContext();

  return useQuery(
    async () => {
      if (!client) return null;
      return address ? client.getAccountDeposits(address) : client.getDeposits();
    },
    [client, address],
  );
}

export function useDeposit(depositId: bigint | number | string | undefined) {
  const { client } = useOfframpContext();

  return useQuery(
    async () => {
      if (!client || depositId == null) return null;
      return client.getDeposit(depositId);
    },
    [client, depositId],
  );
}

export function useIntents(address?: `0x${string}`) {
  const { client } = useOfframpContext();

  return useQuery(
    async () => {
      if (!client) return null;
      return address ? client.getAccountIntents(address) : client.getIntents();
    },
    [client, address],
  );
}

export function useIntent(intentHash: `0x${string}` | undefined) {
  const { client } = useOfframpContext();

  return useQuery(
    async () => {
      if (!client || !intentHash) return null;
      return client.getIntent(intentHash);
    },
    [client, intentHash],
  );
}
