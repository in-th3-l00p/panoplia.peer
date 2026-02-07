# panoplia.peer

React library for building onramping and offramping using [Peer (ZKP2P)](https://zkp2p.xyz) in your React wallet app. Works in both **web browsers** and **Electron** desktop apps.

## Installation

```bash
npm install panoplia.peer react viem
```

`react` and `viem` are peer dependencies.

## Quick Start

### Onramp (Fiat to Crypto)

Wrap your app with `PeerOnrampProvider`, then use hooks to trigger the onramp flow:

```tsx
import { PeerOnrampProvider, useOnramp, useOnrampState } from 'panoplia.peer';

function App() {
  return (
    <PeerOnrampProvider referrer="MyApp" strategy="auto">
      <OnrampButton />
    </PeerOnrampProvider>
  );
}

function OnrampButton() {
  const { onramp, isReady } = useOnramp();
  const { connectionState, activeStrategy } = useOnrampState();

  return (
    <button
      disabled={!isReady}
      onClick={() =>
        onramp({
          inputCurrency: 'USD',
          inputAmount: 50,
          paymentPlatform: 'venmo',
          recipientAddress: '0x...',
        })
      }
    >
      Buy Crypto ({activeStrategy})
    </button>
  );
}
```

### Offramp (Crypto to Fiat)

Wrap your app with `PeerOfframpProvider`, then use hooks to manage deposits and intents:

```tsx
import { PeerOfframpProvider, useCreateDeposit, useDeposits } from 'panoplia.peer';

function App({ walletClient }) {
  return (
    <PeerOfframpProvider walletClient={walletClient} chainId={8453}>
      <DepositManager />
    </PeerOfframpProvider>
  );
}

function DepositManager() {
  const { data: deposits } = useDeposits();
  const { mutate: createDeposit, isLoading, txHash } = useCreateDeposit();

  return (
    <div>
      <h2>Your Deposits ({deposits?.length ?? 0})</h2>
      <button
        disabled={isLoading}
        onClick={() => createDeposit({ /* deposit params */ })}
      >
        {isLoading ? 'Creating...' : 'Create Deposit'}
      </button>
      {txHash && <p>TX: {txHash}</p>}
    </div>
  );
}
```

## Onramp API

### Strategy Pattern

The onramp uses a dual-platform strategy to work in both web and Electron:

| Strategy | Environment | How it works |
|----------|------------|--------------|
| `extension` | Web browser | Uses the [PeerAuth Chrome extension](https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih) |
| `redirect` | Electron | Opens a URL in the system browser via `openExternalUrl` |
| `auto` (default) | Either | Auto-detects based on `navigator.userAgent` |

### `<PeerOnrampProvider>`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `referrer` | `string` | Yes | - | App name shown in Peer UI |
| `strategy` | `'extension' \| 'redirect' \| 'auto'` | No | `'auto'` | Strategy selection |
| `referrerLogo` | `string` | No | - | App logo URL |
| `callbackUrl` | `string` | No | - | Post-completion redirect URL |
| `redirectBaseUrl` | `string` | No | `'https://peer.com/onramp'` | Base URL for redirect strategy |
| `openExternalUrl` | `(url: string) => void` | No* | `window.open` | Opens URL in system browser |

*Required for Electron — pass `shell.openExternal` from Electron's `shell` module.

### Onramp Hooks

**`useOnrampState()`** — Connection state and strategy info

```ts
const {
  connectionState,     // 'needs_install' | 'needs_connection' | 'ready' | null
  isCheckingState,     // boolean
  activeStrategy,      // 'extension' | 'redirect'
  isExtensionAvailable, // boolean
  refreshState,        // () => Promise<void>
} = useOnrampState();
```

**`useOnrampConnection()`** — Manage extension connection

```ts
const {
  connectionState,     // current state
  requestConnection,   // () => Promise<boolean>
  openInstallPage,     // () => void — opens Chrome Web Store
} = useOnrampConnection();
```

**`useOnramp()`** — Trigger the onramp flow

```ts
const {
  onramp,            // (params?) => void — launches onramp
  buildRedirectUrl,  // (params?) => string — generates a redirect URL
  connectionState,   // current state
  isReady,           // boolean — true when connectionState === 'ready'
} = useOnramp();
```

**`useOnrampProof(callback)`** — Subscribe to proof completion events

```ts
useOnrampProof((result) => {
  if (result.status === 'success') {
    console.log('Proof received:', result.proof);
  }
});
```

### Onramp Params

All onramp params are optional and pre-fill the Peer UI:

```ts
type OnrampParams = {
  referrer?: string;
  referrerLogo?: string;
  inputCurrency?: string;      // e.g. 'USD'
  inputAmount?: string | number;
  paymentPlatform?: string;    // e.g. 'venmo', 'wise'
  toToken?: string;            // e.g. 'USDC'
  amountUsdc?: string | number | bigint;
  recipientAddress?: string;
  callbackUrl?: string;
  intentHash?: string;         // deep-link to existing intent
};
```

### Electron Setup

```tsx
import { shell } from 'electron';

<PeerOnrampProvider
  referrer="MyDesktopApp"
  strategy="redirect"
  openExternalUrl={(url) => shell.openExternal(url)}
  callbackUrl="myapp://onramp-complete"
>
  {children}
</PeerOnrampProvider>
```

For Electron, proof completion must be handled by your app's deep link / custom protocol handler. The library does not handle this automatically.

## Offramp API

### `<PeerOfframpProvider>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `walletClient` | `WalletClient \| null` | Yes | viem wallet client (null = not connected yet) |
| `chainId` | `number` | Yes | Chain ID (8453 for Base, 84532 for Base Sepolia) |
| `apiKey` | `string` | No | API key for authenticated operations |

The provider accepts `null` for `walletClient` so it can mount before the wallet connects. Hooks will return graceful error states until a wallet is available.

### `useOfframpClient()`

Access the underlying `OfframpClient` instance:

```ts
const { client, isReady, initError } = useOfframpClient();
```

### Mutation Hooks

All mutation hooks follow the same pattern:

```ts
const { mutate, isLoading, error, txHash, reset } = useXxx(options?);
```

Options: `{ onSuccess?: (result) => void, onError?: (error) => void }`

| Hook | Description | Params |
|------|-------------|--------|
| `useCreateDeposit` | Create a USDC deposit | `createDeposit(...)` params |
| `useAddFunds` | Add liquidity | `{ depositId, amount }` |
| `useRemoveFunds` | Remove liquidity | `{ depositId, amount }` |
| `useWithdrawDeposit` | Fully close deposit | `{ depositId }` |
| `useSetAcceptingIntents` | Toggle intent acceptance | `{ depositId, accepting }` |
| `useSetIntentRange` | Set min/max amounts | `{ depositId, min, max }` |
| `useSetCurrencyMinRate` | Set conversion thresholds | `{ depositId, paymentMethod, fiatCurrency, minConversionRate }` |

### Query Hooks

All query hooks follow the same pattern:

```ts
const { data, isLoading, error, refetch } = useXxx(params);
```

| Hook | Description | Params |
|------|-------------|--------|
| `useDeposits(address?)` | List deposits (all or by owner) | Optional `0x${string}` |
| `useDeposit(depositId)` | Single deposit | `bigint \| number \| string \| undefined` |
| `useIntents(address?)` | List intents (all or by owner) | Optional `0x${string}` |
| `useIntent(intentHash)` | Single intent | `` `0x${string}` \| undefined `` |

### `usePaymentMethodsCatalog(chainId?, env?)`

Returns the payment method catalog synchronously:

```ts
const { data: catalog, error } = usePaymentMethodsCatalog(8453, 'production');
```

## Utilities

```ts
import {
  isElectron,          // () => boolean
  isBrowser,           // () => boolean
  detectPlatform,      // () => 'web' | 'electron' | 'unknown'
  SUPPORTED_CHAIN_IDS, // { BASE_MAINNET: 8453, BASE_SEPOLIA: 84532, ... }
  formatTokenAddress,  // (string) => `0x${string}`
  buildOnrampRedirectUrl, // (params?, options?) => string
} from 'panoplia.peer';
```

## Advanced: Custom Strategies

You can create strategies directly for full control:

```ts
import { createOnrampStrategy, ExtensionOnrampStrategy, RedirectOnrampStrategy } from 'panoplia.peer';

// Factory with auto-detection
const strategy = createOnrampStrategy('auto', { referrer: 'MyApp' });

// Or instantiate directly
const extension = new ExtensionOnrampStrategy();
const redirect = new RedirectOnrampStrategy({
  referrer: 'MyApp',
  openExternalUrl: (url) => window.open(url),
});
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Build ESM + CJS + declarations
npm run typecheck    # TypeScript type checking
npm test             # Run test suite (vitest)
npm run test:watch   # Watch mode
```

## Build Output

```
dist/
  index.mjs      # ESM
  index.cjs      # CJS
  index.d.ts     # CJS declarations
  index.d.cts    # CJS declarations
```

## License

MIT
