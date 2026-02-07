import { describe, it, expect } from 'vitest';
import { buildOnrampRedirectUrl } from '../../onramp/url';

describe('buildOnrampRedirectUrl', () => {
  it('returns default base URL with no params', () => {
    const url = buildOnrampRedirectUrl();
    expect(url).toBe('https://peer.com/onramp');
  });

  it('uses custom base URL from options', () => {
    const url = buildOnrampRedirectUrl(undefined, {
      baseUrl: 'https://custom.example.com/ramp',
    });
    expect(url).toBe('https://custom.example.com/ramp');
  });

  it('includes referrer from options', () => {
    const url = buildOnrampRedirectUrl(undefined, { referrer: 'MyApp' });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('referrer')).toBe('MyApp');
  });

  it('includes all options params', () => {
    const url = buildOnrampRedirectUrl(undefined, {
      referrer: 'MyApp',
      referrerLogo: 'https://example.com/logo.png',
      callbackUrl: 'https://example.com/callback',
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('referrer')).toBe('MyApp');
    expect(parsed.searchParams.get('referrerLogo')).toBe('https://example.com/logo.png');
    expect(parsed.searchParams.get('callbackUrl')).toBe('https://example.com/callback');
  });

  it('includes onramp params', () => {
    const url = buildOnrampRedirectUrl({
      inputCurrency: 'USD',
      inputAmount: 100,
      paymentPlatform: 'venmo',
      toToken: 'USDC',
      amountUsdc: '100000000',
      recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('inputCurrency')).toBe('USD');
    expect(parsed.searchParams.get('inputAmount')).toBe('100');
    expect(parsed.searchParams.get('paymentPlatform')).toBe('venmo');
    expect(parsed.searchParams.get('toToken')).toBe('USDC');
    expect(parsed.searchParams.get('amountUsdc')).toBe('100000000');
    expect(parsed.searchParams.get('recipientAddress')).toBe(
      '0x1234567890abcdef1234567890abcdef12345678',
    );
  });

  it('params.referrer overrides options.referrer', () => {
    const url = buildOnrampRedirectUrl(
      { referrer: 'ParamApp' },
      { referrer: 'OptionsApp' },
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('referrer')).toBe('ParamApp');
  });

  it('includes intentHash for deep linking', () => {
    const url = buildOnrampRedirectUrl({ intentHash: '0xdeadbeef' });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('intentHash')).toBe('0xdeadbeef');
  });

  it('params.callbackUrl overrides options.callbackUrl', () => {
    const url = buildOnrampRedirectUrl(
      { callbackUrl: 'https://param.com/cb' },
      { callbackUrl: 'https://option.com/cb' },
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('callbackUrl')).toBe('https://param.com/cb');
  });

  it('handles bigint amountUsdc', () => {
    const url = buildOnrampRedirectUrl({ amountUsdc: BigInt('100000000') });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('amountUsdc')).toBe('100000000');
  });
});
