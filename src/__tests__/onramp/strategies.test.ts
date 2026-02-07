import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedirectOnrampStrategy } from '../../onramp/strategies/redirect';
import { createOnrampStrategy } from '../../onramp/strategies';

// Mock peerExtensionSdk for ExtensionOnrampStrategy
vi.mock('@zkp2p/sdk', () => ({
  peerExtensionSdk: {
    getState: vi.fn().mockResolvedValue('needs_install'),
    isAvailable: vi.fn().mockReturnValue(false),
    requestConnection: vi.fn().mockResolvedValue(false),
    openInstallPage: vi.fn(),
    onramp: vi.fn(),
    onProofComplete: vi.fn().mockReturnValue(() => {}),
  },
}));

// Mock platform detection
vi.mock('../../utils/platform', () => ({
  isElectron: vi.fn().mockReturnValue(false),
}));

import { peerExtensionSdk } from '@zkp2p/sdk';
import { isElectron } from '../../utils/platform';
import { ExtensionOnrampStrategy } from '../../onramp/strategies/extension';

describe('ExtensionOnrampStrategy', () => {
  let strategy: ExtensionOnrampStrategy;

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new ExtensionOnrampStrategy();
  });

  it('has type "extension"', () => {
    expect(strategy.type).toBe('extension');
  });

  it('delegates getState to peerExtensionSdk', async () => {
    const state = await strategy.getState();
    expect(peerExtensionSdk.getState).toHaveBeenCalled();
    expect(state).toBe('needs_install');
  });

  it('delegates isAvailable to peerExtensionSdk', () => {
    const available = strategy.isAvailable();
    expect(peerExtensionSdk.isAvailable).toHaveBeenCalled();
    expect(available).toBe(false);
  });

  it('delegates requestConnection to peerExtensionSdk', async () => {
    const result = await strategy.requestConnection();
    expect(peerExtensionSdk.requestConnection).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('delegates openInstallPage to peerExtensionSdk', () => {
    strategy.openInstallPage();
    expect(peerExtensionSdk.openInstallPage).toHaveBeenCalled();
  });

  it('delegates onramp to peerExtensionSdk', () => {
    const params = { referrer: 'Test', inputCurrency: 'USD' };
    strategy.onramp(params);
    expect(peerExtensionSdk.onramp).toHaveBeenCalledWith(params);
  });

  it('delegates onProofComplete to peerExtensionSdk', () => {
    const cb = vi.fn();
    const unsub = strategy.onProofComplete(cb);
    expect(peerExtensionSdk.onProofComplete).toHaveBeenCalledWith(cb);
    expect(typeof unsub).toBe('function');
  });
});

describe('RedirectOnrampStrategy', () => {
  let strategy: RedirectOnrampStrategy;
  let openExternalUrl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    openExternalUrl = vi.fn();
    strategy = new RedirectOnrampStrategy({
      referrer: 'TestApp',
      referrerLogo: 'https://example.com/logo.png',
      callbackUrl: 'https://example.com/callback',
      redirectBaseUrl: 'https://custom.peer.com/onramp',
      openExternalUrl,
    });
  });

  it('has type "redirect"', () => {
    expect(strategy.type).toBe('redirect');
  });

  it('getState always returns "ready"', async () => {
    expect(await strategy.getState()).toBe('ready');
  });

  it('isAvailable always returns true', () => {
    expect(strategy.isAvailable()).toBe(true);
  });

  it('requestConnection always returns true', async () => {
    expect(await strategy.requestConnection()).toBe(true);
  });

  it('openInstallPage is a no-op', () => {
    // Should not throw
    strategy.openInstallPage();
  });

  it('onramp calls openExternalUrl with a built URL', () => {
    strategy.onramp({ inputCurrency: 'USD', inputAmount: 50 });
    expect(openExternalUrl).toHaveBeenCalledTimes(1);
    const calledUrl = openExternalUrl.mock.calls[0][0];
    const parsed = new URL(calledUrl);
    expect(parsed.origin).toBe('https://custom.peer.com');
    expect(parsed.searchParams.get('referrer')).toBe('TestApp');
    expect(parsed.searchParams.get('inputCurrency')).toBe('USD');
    expect(parsed.searchParams.get('inputAmount')).toBe('50');
  });

  it('onramp falls back to window.open when no openExternalUrl', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const strategyNoExternalUrl = new RedirectOnrampStrategy({
      referrer: 'TestApp',
    });
    strategyNoExternalUrl.onramp({ inputCurrency: 'EUR' });
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    windowOpenSpy.mockRestore();
  });

  it('onProofComplete returns a no-op unsubscribe', () => {
    const cb = vi.fn();
    const unsub = strategy.onProofComplete(cb);
    expect(typeof unsub).toBe('function');
    // Calling unsub should not throw
    unsub();
  });
});

describe('createOnrampStrategy', () => {
  const redirectOptions = {
    referrer: 'TestApp',
    openExternalUrl: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ExtensionOnrampStrategy for "extension"', () => {
    const strategy = createOnrampStrategy('extension', redirectOptions);
    expect(strategy.type).toBe('extension');
    expect(strategy).toBeInstanceOf(ExtensionOnrampStrategy);
  });

  it('returns RedirectOnrampStrategy for "redirect"', () => {
    const strategy = createOnrampStrategy('redirect', redirectOptions);
    expect(strategy.type).toBe('redirect');
    expect(strategy).toBeInstanceOf(RedirectOnrampStrategy);
  });

  it('returns ExtensionOnrampStrategy for "auto" in browser (non-Electron)', () => {
    vi.mocked(isElectron).mockReturnValue(false);
    const strategy = createOnrampStrategy('auto', redirectOptions);
    expect(strategy.type).toBe('extension');
  });

  it('returns RedirectOnrampStrategy for "auto" in Electron', () => {
    vi.mocked(isElectron).mockReturnValue(true);
    const strategy = createOnrampStrategy('auto', redirectOptions);
    expect(strategy.type).toBe('redirect');
  });
});
