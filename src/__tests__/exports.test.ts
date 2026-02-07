import { describe, it, expect, vi } from 'vitest';

vi.mock('@zkp2p/sdk', () => ({
  peerExtensionSdk: {
    getState: vi.fn(),
    isAvailable: vi.fn(),
    requestConnection: vi.fn(),
    openInstallPage: vi.fn(),
    onramp: vi.fn(),
    onProofComplete: vi.fn(),
  },
  OfframpClient: vi.fn().mockImplementation(function () {
    return {};
  }),
  getPaymentMethodsCatalog: vi.fn().mockReturnValue({ paymentMethods: [] }),
}));

import * as api from '../index';

describe('public API exports', () => {
  // Utils
  it('exports isElectron', () => expect(api.isElectron).toBeTypeOf('function'));
  it('exports isBrowser', () => expect(api.isBrowser).toBeTypeOf('function'));
  it('exports detectPlatform', () => expect(api.detectPlatform).toBeTypeOf('function'));
  it('exports SUPPORTED_CHAIN_IDS', () => expect(api.SUPPORTED_CHAIN_IDS).toBeDefined());
  it('exports formatTokenAddress', () => expect(api.formatTokenAddress).toBeTypeOf('function'));

  // Onramp
  it('exports PeerOnrampProvider', () => expect(api.PeerOnrampProvider).toBeTypeOf('function'));
  it('exports useOnrampState', () => expect(api.useOnrampState).toBeTypeOf('function'));
  it('exports useOnrampConnection', () => expect(api.useOnrampConnection).toBeTypeOf('function'));
  it('exports useOnramp', () => expect(api.useOnramp).toBeTypeOf('function'));
  it('exports useOnrampProof', () => expect(api.useOnrampProof).toBeTypeOf('function'));
  it('exports buildOnrampRedirectUrl', () =>
    expect(api.buildOnrampRedirectUrl).toBeTypeOf('function'));
  it('exports createOnrampStrategy', () =>
    expect(api.createOnrampStrategy).toBeTypeOf('function'));
  it('exports ExtensionOnrampStrategy', () =>
    expect(api.ExtensionOnrampStrategy).toBeTypeOf('function'));
  it('exports RedirectOnrampStrategy', () =>
    expect(api.RedirectOnrampStrategy).toBeTypeOf('function'));

  // Offramp
  it('exports PeerOfframpProvider', () => expect(api.PeerOfframpProvider).toBeTypeOf('function'));
  it('exports useOfframpClient', () => expect(api.useOfframpClient).toBeTypeOf('function'));
  it('exports useCreateDeposit', () => expect(api.useCreateDeposit).toBeTypeOf('function'));
  it('exports useAddFunds', () => expect(api.useAddFunds).toBeTypeOf('function'));
  it('exports useRemoveFunds', () => expect(api.useRemoveFunds).toBeTypeOf('function'));
  it('exports useWithdrawDeposit', () => expect(api.useWithdrawDeposit).toBeTypeOf('function'));
  it('exports useSetAcceptingIntents', () =>
    expect(api.useSetAcceptingIntents).toBeTypeOf('function'));
  it('exports useSetIntentRange', () => expect(api.useSetIntentRange).toBeTypeOf('function'));
  it('exports useSetCurrencyMinRate', () =>
    expect(api.useSetCurrencyMinRate).toBeTypeOf('function'));
  it('exports useDeposits', () => expect(api.useDeposits).toBeTypeOf('function'));
  it('exports useDeposit', () => expect(api.useDeposit).toBeTypeOf('function'));
  it('exports useIntents', () => expect(api.useIntents).toBeTypeOf('function'));
  it('exports useIntent', () => expect(api.useIntent).toBeTypeOf('function'));
  it('exports usePaymentMethodsCatalog', () =>
    expect(api.usePaymentMethodsCatalog).toBeTypeOf('function'));
});
