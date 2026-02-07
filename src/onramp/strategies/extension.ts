import { peerExtensionSdk } from '@zkp2p/sdk';
import type { OnrampParams, OnrampProofCallback, PeerExtensionState } from '../../types';
import type { OnrampStrategyInterface } from './types';

export class ExtensionOnrampStrategy implements OnrampStrategyInterface {
  readonly type = 'extension' as const;

  getState(): Promise<PeerExtensionState> {
    return peerExtensionSdk.getState();
  }

  isAvailable(): boolean {
    return peerExtensionSdk.isAvailable();
  }

  requestConnection(): Promise<boolean> {
    return peerExtensionSdk.requestConnection();
  }

  openInstallPage(): void {
    peerExtensionSdk.openInstallPage();
  }

  onramp(params?: OnrampParams): void {
    peerExtensionSdk.onramp(params);
  }

  onProofComplete(callback: OnrampProofCallback): () => void {
    return peerExtensionSdk.onProofComplete(callback);
  }
}
