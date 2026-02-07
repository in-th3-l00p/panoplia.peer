import type {
  PeerExtensionOnrampParams,
  PeerExtensionState,
  PeerConnectionStatus,
  PeerProofCompleteResult,
  PeerProofCompleteCallback,
} from '@zkp2p/sdk';

export type OnrampStrategy = 'extension' | 'redirect' | 'auto';

export type OnrampParams = PeerExtensionOnrampParams;

export type OnrampProof = PeerProofCompleteResult;
export type OnrampProofCallback = PeerProofCompleteCallback;

export type PeerOnrampConfig = {
  strategy?: OnrampStrategy;
  referrer: string;
  referrerLogo?: string;
  callbackUrl?: string;
  redirectBaseUrl?: string;
  openExternalUrl?: (url: string) => void;
};

export type OnrampConnectionState = {
  connectionState: PeerExtensionState | null;
  isCheckingState: boolean;
  activeStrategy: 'extension' | 'redirect';
  isExtensionAvailable: boolean;
  refreshState: () => Promise<void>;
};

export type OnrampConnectionActions = {
  connectionState: PeerExtensionState | null;
  requestConnection: () => Promise<boolean>;
  openInstallPage: () => void;
};

export type OnrampActions = {
  onramp: (params?: OnrampParams) => void;
  buildRedirectUrl: (params?: OnrampParams) => string;
  connectionState: PeerExtensionState | null;
  isReady: boolean;
};

export type {
  PeerExtensionState,
  PeerConnectionStatus,
  PeerProofCompleteResult,
  PeerProofCompleteCallback,
};
