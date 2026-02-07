# CLAUDE.md — AI Development Guide for panoplia.peer

## Project Summary

React library wrapping `@zkp2p/sdk` to provide idiomatic React hooks and context providers for crypto on/offramp flows. Single npm package, single entry point.

## Commands

```bash
npm run build        # tsup → dist/index.{mjs,cjs,d.ts,d.cts}
npm run typecheck    # tsc --noEmit
npm test             # vitest run (125 tests)
npm run test:watch   # vitest watch mode
```

Always run `npm test` after making changes. Always run `npm run build` before considering a change complete — the DTS build catches type errors that vitest doesn't.

## Architecture

```
src/
  index.ts                     # Barrel export — all public API
  types/                       # Type definitions only, no runtime code
    common.ts                  # Platform, ChainId, TokenIdentifier, PaymentPlatform
    onramp.ts                  # OnrampParams, OnrampProof, PeerOnrampConfig, etc.
    offramp.ts                 # PeerOfframpConfig, MutationResult, QueryResult, etc.
  utils/
    platform.ts                # isElectron(), isBrowser(), detectPlatform()
    chains.ts                  # SUPPORTED_CHAIN_IDS, formatTokenAddress()
  onramp/
    url.ts                     # buildOnrampRedirectUrl() — pure function, no deps
    strategies/
      types.ts                 # OnrampStrategyInterface
      extension.ts             # ExtensionOnrampStrategy — wraps peerExtensionSdk
      redirect.ts              # RedirectOnrampStrategy — builds URL, calls openExternalUrl
      index.ts                 # createOnrampStrategy() factory + re-exports
    context.ts                 # PeerOnrampProvider + OnrampContext
    hooks.ts                   # useOnrampState, useOnrampConnection, useOnramp, useOnrampProof
  offramp/
    context.ts                 # PeerOfframpProvider + OfframpContext + useOfframpClient
    hooks/
      mutations.ts             # useCreateDeposit, useAddFunds, useRemoveFunds, etc.
      queries.ts               # useDeposits, useDeposit, useIntents, useIntent
      catalog.ts               # usePaymentMethodsCatalog
  __tests__/                   # Mirror of src structure
```

## Key Design Decisions

1. **Single dependency**: `@zkp2p/sdk` (not separate `@zkp2p/offramp-sdk`). The unified SDK re-exports everything from the offramp SDK plus the extension SDK.

2. **Strategy pattern for onramp only**: Offramp works identically in web and Electron (standard API client). Onramp needs dual strategies because it depends on the PeerAuth Chrome extension.

3. **`walletClient` accepts null**: The `PeerOfframpProvider` can mount before wallet connects. The `OfframpClient` is created in a `useEffect` — hooks return `null`/error states until a wallet is available.

4. **`useCreateDeposit` has dedicated implementation**: Unlike other mutation hooks that use the generic `useMutation` helper, `useCreateDeposit` has its own implementation because `client.createDeposit()` returns `{ hash, depositDetails }` (not just a hash).

5. **No JSX in source**: All providers use `React.createElement()` to avoid requiring JSX transform configuration.

## SDK API Gotchas

These are critical to know when modifying the code:

- **`getPaymentMethodsCatalog(chainId, env)` is SYNCHRONOUS** — not async. `chainId` is required (not optional). This is why `usePaymentMethodsCatalog` uses `useMemo` instead of async state.

- **`OfframpClient` constructor takes `Zkp2pNextOptions`** — `{ walletClient, chainId, apiKey?, runtimeEnv?, ... }`. It's synchronous but can throw.

- **`peerExtensionSdk` is a pre-built singleton** from `@zkp2p/sdk`. It checks `window.peer` for the browser extension.

- **`PeerExtensionState`** = `'needs_install' | 'needs_connection' | 'ready'` — these are the only three values.

- **Mutation methods** like `addFunds`, `removeFunds`, etc. are `PrepareableMethod` instances — callable directly (returns `Promise<Hash>`) or via `.prepare()` (returns `PreparedTransaction`). Our hooks only use the direct call pattern.

## Testing Patterns

**Framework**: Vitest + React Testing Library + jsdom

**Mock pattern for `@zkp2p/sdk`**: Every test file that imports source code must mock `@zkp2p/sdk` at module level:

```ts
vi.mock('@zkp2p/sdk', () => ({
  OfframpClient: vi.fn().mockImplementation(function () {
    return mockClient;  // must use `function`, not arrow, for constructor mock
  }),
  peerExtensionSdk: { /* mock methods */ },
  getPaymentMethodsCatalog: vi.fn().mockReturnValue({ paymentMethods: [] }),
}));
```

**IMPORTANT**: Use `function` (not arrow) in `mockImplementation` for constructor mocks. Vitest warns otherwise.

**Async timing with `PeerOfframpProvider`**: The `OfframpClient` is created in a `useEffect`, so the client is `null` on the first render. Query hooks auto-refetch when the client reference changes (via `useCallback` deps). Always use `waitFor` to wait for data to appear:

```ts
await waitFor(() => {
  expect(result.current.data).toEqual(expectedData);
});
```

**Async timing with `PeerOnrampProvider`**: The provider calls `strategy.getState()` on mount. Use `waitFor` to wait for `isCheckingState` to become `false`.

## Adding New Features

### Adding a new offramp mutation hook

1. Add params type if needed
2. Add the hook in `src/offramp/hooks/mutations.ts` using the `useMutation` helper
3. Export from `src/offramp/hooks/index.ts`
4. Export from `src/offramp/index.ts`
5. Export from `src/index.ts`
6. Add test in `src/__tests__/offramp/mutations.test.ts` (add to the `describe.each` array)
7. Add export check in `src/__tests__/exports.test.ts`

### Adding a new offramp query hook

1. Add the hook in `src/offramp/hooks/queries.ts` using the `useQuery` helper
2. Follow same export chain as mutations
3. Add test in `src/__tests__/offramp/queries.test.ts`

### Adding a new onramp strategy

1. Create `src/onramp/strategies/newstrategy.ts` implementing `OnrampStrategyInterface`
2. Add to the `createOnrampStrategy` factory in `src/onramp/strategies/index.ts`
3. Update `OnrampStrategy` type in `src/types/onramp.ts`
4. Add tests in `src/__tests__/onramp/strategies.test.ts`

## File Count

- 22 source files
- 10 test files (125 tests)
- Build output: 4 files in `dist/`
