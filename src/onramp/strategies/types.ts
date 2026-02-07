import type { OnrampParams, OnrampProofCallback, PeerExtensionState } from '../../types';

export interface OnrampStrategyInterface {
  readonly type: 'extension' | 'redirect';

  getState(): Promise<PeerExtensionState>;
  isAvailable(): boolean;
  requestConnection(): Promise<boolean>;
  openInstallPage(): void;
  onramp(params?: OnrampParams): void;
  onProofComplete(callback: OnrampProofCallback): () => void;
}
