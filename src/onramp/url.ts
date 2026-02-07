import type { OnrampParams } from '../types';

const DEFAULT_REDIRECT_BASE_URL = 'https://peer.com/onramp';

export function buildOnrampRedirectUrl(
  params?: OnrampParams,
  options?: {
    baseUrl?: string;
    referrer?: string;
    referrerLogo?: string;
    callbackUrl?: string;
  },
): string {
  const baseUrl = options?.baseUrl ?? DEFAULT_REDIRECT_BASE_URL;
  const url = new URL(baseUrl);

  if (options?.referrer) url.searchParams.set('referrer', options.referrer);
  if (options?.referrerLogo) url.searchParams.set('referrerLogo', options.referrerLogo);
  if (options?.callbackUrl) url.searchParams.set('callbackUrl', options.callbackUrl);

  if (params) {
    if (params.referrer) url.searchParams.set('referrer', params.referrer);
    if (params.referrerLogo) url.searchParams.set('referrerLogo', params.referrerLogo);
    if (params.inputCurrency) url.searchParams.set('inputCurrency', params.inputCurrency);
    if (params.inputAmount != null) url.searchParams.set('inputAmount', String(params.inputAmount));
    if (params.paymentPlatform) url.searchParams.set('paymentPlatform', params.paymentPlatform);
    if (params.toToken) url.searchParams.set('toToken', params.toToken);
    if (params.amountUsdc != null) url.searchParams.set('amountUsdc', String(params.amountUsdc));
    if (params.recipientAddress) url.searchParams.set('recipientAddress', params.recipientAddress);
    if (params.callbackUrl) url.searchParams.set('callbackUrl', params.callbackUrl);
    if (params.intentHash) url.searchParams.set('intentHash', params.intentHash);
  }

  return url.toString();
}
