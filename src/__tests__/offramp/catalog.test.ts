import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@zkp2p/sdk', () => ({
  getPaymentMethodsCatalog: vi.fn().mockReturnValue({
    paymentMethods: [
      { name: 'venmo', displayName: 'Venmo' },
      { name: 'wise', displayName: 'Wise' },
    ],
  }),
}));

import { getPaymentMethodsCatalog } from '@zkp2p/sdk';
import { usePaymentMethodsCatalog } from '../../offramp/hooks/catalog';

const mockCatalog = {
  paymentMethods: [
    { name: 'venmo', displayName: 'Venmo' },
    { name: 'wise', displayName: 'Wise' },
  ],
};

describe('usePaymentMethodsCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaymentMethodsCatalog).mockReturnValue(mockCatalog as any);
  });

  it('returns catalog data for default chainId', () => {
    const { result } = renderHook(() => usePaymentMethodsCatalog());

    expect(getPaymentMethodsCatalog).toHaveBeenCalledWith(8453, 'production');
    expect(result.current.data).toEqual(mockCatalog);
    expect(result.current.error).toBeNull();
  });

  it('passes custom chainId and env', () => {
    const { result } = renderHook(() => usePaymentMethodsCatalog(84532, 'staging'));

    expect(getPaymentMethodsCatalog).toHaveBeenCalledWith(84532, 'staging');
    expect(result.current.data).toEqual(mockCatalog);
  });

  it('returns error when getPaymentMethodsCatalog throws', () => {
    vi.mocked(getPaymentMethodsCatalog).mockImplementation(() => {
      throw new Error('Unsupported chain');
    });

    const { result } = renderHook(() => usePaymentMethodsCatalog(99999));

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe('Unsupported chain');
  });
});
