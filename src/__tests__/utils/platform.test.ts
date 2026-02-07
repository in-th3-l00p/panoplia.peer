import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isElectron, isBrowser, detectPlatform } from '../../utils/platform';

describe('platform utilities', () => {
  const originalNavigator = globalThis.navigator;
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isElectron', () => {
    it('returns true when userAgent includes Electron', () => {
      vi.stubGlobal('navigator', {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Electron/28.0.0',
      });
      expect(isElectron()).toBe(true);
    });

    it('returns false for a standard browser userAgent', () => {
      vi.stubGlobal('navigator', {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
      });
      expect(isElectron()).toBe(false);
    });

    it('returns false when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isElectron()).toBe(false);
    });
  });

  describe('isBrowser', () => {
    it('returns true in a standard browser environment', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
      });
      // window and document are defined in jsdom by default
      expect(isBrowser()).toBe(true);
    });

    it('returns false in Electron', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Electron/28.0.0',
      });
      expect(isBrowser()).toBe(false);
    });
  });

  describe('detectPlatform', () => {
    it('returns "web" in a standard browser', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
      });
      expect(detectPlatform()).toBe('web');
    });

    it('returns "electron" when Electron user agent is present', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Electron/28.0.0',
      });
      expect(detectPlatform()).toBe('electron');
    });

    it('returns "unknown" when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(detectPlatform()).toBe('unknown');
    });
  });
});
