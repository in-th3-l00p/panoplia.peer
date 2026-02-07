import { describe, it, expect } from 'vitest';
import { SUPPORTED_CHAIN_IDS, formatTokenAddress } from '../../utils/chains';

describe('chain utilities', () => {
  describe('SUPPORTED_CHAIN_IDS', () => {
    it('contains Base mainnet', () => {
      expect(SUPPORTED_CHAIN_IDS.BASE_MAINNET).toBe(8453);
    });

    it('contains Base Sepolia', () => {
      expect(SUPPORTED_CHAIN_IDS.BASE_SEPOLIA).toBe(84532);
    });

    it('contains Scroll mainnet', () => {
      expect(SUPPORTED_CHAIN_IDS.SCROLL_MAINNET).toBe(534352);
    });

    it('contains Hardhat', () => {
      expect(SUPPORTED_CHAIN_IDS.HARDHAT).toBe(31337);
    });
  });

  describe('formatTokenAddress', () => {
    it('lowercases an 0x-prefixed address', () => {
      expect(formatTokenAddress('0xABcDeF1234567890abcdef1234567890ABCDEF12')).toBe(
        '0xabcdef1234567890abcdef1234567890abcdef12',
      );
    });

    it('adds 0x prefix if missing', () => {
      expect(formatTokenAddress('abcdef1234567890')).toBe('0xabcdef1234567890');
    });

    it('trims whitespace', () => {
      expect(formatTokenAddress('  0xABC  ')).toBe('0xabc');
    });

    it('handles already-formatted addresses', () => {
      expect(formatTokenAddress('0xdeadbeef')).toBe('0xdeadbeef');
    });
  });
});
