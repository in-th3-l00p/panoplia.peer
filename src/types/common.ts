export type Platform = 'web' | 'electron' | 'unknown';

export type ChainId = 8453 | 84532 | 534352 | 31337;

export type TokenIdentifier = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  chainId: ChainId;
};

export type PaymentPlatform =
  | 'wise'
  | 'venmo'
  | 'revolut'
  | 'cashapp'
  | 'mercadopago'
  | 'zelle'
  | 'paypal'
  | 'monzo'
  | 'chime'
  | 'n26';
