import { isElectron } from '../../utils/platform';
import type { OnrampStrategy } from '../../types';
import type { OnrampStrategyInterface } from './types';
import { ExtensionOnrampStrategy } from './extension';
import { RedirectOnrampStrategy } from './redirect';
import type { RedirectOnrampStrategyOptions } from './redirect';

export type { OnrampStrategyInterface } from './types';
export { ExtensionOnrampStrategy } from './extension';
export { RedirectOnrampStrategy } from './redirect';
export type { RedirectOnrampStrategyOptions } from './redirect';

export function createOnrampStrategy(
  strategy: OnrampStrategy,
  redirectOptions: RedirectOnrampStrategyOptions,
): OnrampStrategyInterface {
  if (strategy === 'auto') {
    return isElectron()
      ? new RedirectOnrampStrategy(redirectOptions)
      : new ExtensionOnrampStrategy();
  }

  if (strategy === 'redirect') {
    return new RedirectOnrampStrategy(redirectOptions);
  }

  return new ExtensionOnrampStrategy();
}
