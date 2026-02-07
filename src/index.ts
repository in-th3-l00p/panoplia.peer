// Types
export type {
  Platform,
  ChainId,
  TokenIdentifier,
  PaymentPlatform,
  OnrampStrategy,
  OnrampParams,
  OnrampProof,
  OnrampProofCallback,
  PeerOnrampConfig,
  OnrampConnectionState,
  OnrampConnectionActions,
  OnrampActions,
  PeerExtensionState,
  PeerConnectionStatus,
  PeerProofCompleteResult,
  PeerProofCompleteCallback,
  PeerOfframpConfig,
  MutationResult,
  MutationWithHashResult,
  MutationOptions,
  QueryResult,
  OfframpClientState,
  OfframpClient,
} from './types';

// Utils
export { isElectron, isBrowser, detectPlatform } from './utils';
export { SUPPORTED_CHAIN_IDS, formatTokenAddress } from './utils';

// Onramp
export { PeerOnrampProvider } from './onramp';
export type { PeerOnrampProviderProps } from './onramp';
export { useOnrampState, useOnrampConnection, useOnramp, useOnrampProof } from './onramp';
export { buildOnrampRedirectUrl } from './onramp';
export {
  createOnrampStrategy,
  ExtensionOnrampStrategy,
  RedirectOnrampStrategy,
} from './onramp';
export type { OnrampStrategyInterface, RedirectOnrampStrategyOptions } from './onramp';

// Offramp
export { PeerOfframpProvider, useOfframpClient } from './offramp';
export type { PeerOfframpProviderProps } from './offramp';
export {
  useCreateDeposit,
  useAddFunds,
  useRemoveFunds,
  useWithdrawDeposit,
  useSetAcceptingIntents,
  useSetIntentRange,
  useSetCurrencyMinRate,
  useDeposits,
  useDeposit,
  useIntents,
  useIntent,
  usePaymentMethodsCatalog,
} from './offramp';
