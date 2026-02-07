import type { Platform } from '../types';

export function isElectron(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('Electron')
  );
}

export function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    !isElectron()
  );
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  if (isElectron()) return 'electron';
  if (isBrowser()) return 'web';
  return 'unknown';
}
