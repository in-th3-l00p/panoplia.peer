import { useState, useCallback, useMemo } from 'react';
import type { Hash } from 'viem';
import type { OfframpClient } from '@zkp2p/sdk';
import type { MutationWithHashResult, MutationOptions } from '../../types';
import { useOfframpContext } from '../context';

function useMutation<TParams>(
  methodName: string,
  options?: MutationOptions,
): MutationWithHashResult & { execute: (params: TParams) => Promise<Hash | undefined> } {
  const { client } = useOfframpContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxHash(null);
  }, []);

  const execute = useCallback(
    async (params: TParams): Promise<Hash | undefined> => {
      if (!client) {
        const err = new Error('OfframpClient not initialized. Ensure wallet is connected.');
        setError(err);
        options?.onError?.(err);
        return undefined;
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const method = (client as any)[methodName];
        if (typeof method !== 'function') {
          throw new Error(`Method ${methodName} not found on OfframpClient`);
        }
        const result = await method.call(client, params);
        const hash = typeof result === 'string' ? (result as Hash) : result?.hash;
        setTxHash(hash ?? null);
        options?.onSuccess?.(result);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [client, methodName, options],
  );

  return useMemo(
    () => ({ mutate: execute, execute, isLoading, error, txHash, reset }),
    [execute, isLoading, error, txHash, reset],
  );
}

export function useCreateDeposit(options?: MutationOptions) {
  const { client } = useOfframpContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxHash(null);
  }, []);

  const mutate = useCallback(
    async (params: Parameters<OfframpClient['createDeposit']>[0]) => {
      if (!client) {
        const err = new Error('OfframpClient not initialized. Ensure wallet is connected.');
        setError(err);
        options?.onError?.(err);
        return undefined;
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const result = await client.createDeposit(params);
        setTxHash(result.hash);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [client, options],
  );

  return useMemo(
    () => ({ mutate, isLoading, error, txHash, reset }),
    [mutate, isLoading, error, txHash, reset],
  );
}

export function useAddFunds(options?: MutationOptions) {
  return useMutation<{ depositId: bigint; amount: bigint }>('addFunds', options);
}

export function useRemoveFunds(options?: MutationOptions) {
  return useMutation<{ depositId: bigint; amount: bigint }>('removeFunds', options);
}

export function useWithdrawDeposit(options?: MutationOptions) {
  return useMutation<{ depositId: bigint }>('withdrawDeposit', options);
}

export function useSetAcceptingIntents(options?: MutationOptions) {
  return useMutation<{ depositId: bigint; accepting: boolean }>('setAcceptingIntents', options);
}

export function useSetIntentRange(options?: MutationOptions) {
  return useMutation<{ depositId: bigint; min: bigint; max: bigint }>('setIntentRange', options);
}

export function useSetCurrencyMinRate(options?: MutationOptions) {
  return useMutation<{
    depositId: bigint;
    paymentMethod: `0x${string}`;
    fiatCurrency: `0x${string}`;
    minConversionRate: bigint;
  }>('setCurrencyMinRate', options);
}
