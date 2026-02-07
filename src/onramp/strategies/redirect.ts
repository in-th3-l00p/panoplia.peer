import type { OnrampParams, OnrampProofCallback, PeerExtensionState } from '../../types';
import type { OnrampStrategyInterface } from './types';
import { buildOnrampRedirectUrl } from '../url';

export type RedirectOnrampStrategyOptions = {
  referrer: string;
  referrerLogo?: string;
  callbackUrl?: string;
  redirectBaseUrl?: string;
  openExternalUrl?: (url: string) => void;
};

export class RedirectOnrampStrategy implements OnrampStrategyInterface {
  readonly type = 'redirect' as const;
  private options: RedirectOnrampStrategyOptions;

  constructor(options: RedirectOnrampStrategyOptions) {
    this.options = options;
  }

  async getState(): Promise<PeerExtensionState> {
    // Redirect strategy is always "ready" — no extension dependency
    return 'ready';
  }

  isAvailable(): boolean {
    // Redirect strategy is always available
    return true;
  }

  async requestConnection(): Promise<boolean> {
    // No extension connection needed for redirect
    return true;
  }

  openInstallPage(): void {
    // No-op: redirect strategy doesn't need the extension
  }

  onramp(params?: OnrampParams): void {
    const url = buildOnrampRedirectUrl(params, {
      baseUrl: this.options.redirectBaseUrl,
      referrer: this.options.referrer,
      referrerLogo: this.options.referrerLogo,
      callbackUrl: this.options.callbackUrl,
    });

    if (this.options.openExternalUrl) {
      this.options.openExternalUrl(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  onProofComplete(_callback: OnrampProofCallback): () => void {
    // No-op for redirect strategy — proof completion is handled by the
    // consumer via deep link / custom protocol handler
    return () => {};
  }
}
