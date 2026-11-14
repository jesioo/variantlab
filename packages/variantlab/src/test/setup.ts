import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Unexpected console output, React warnings included, fails the test. A test that expects
// an error silences it with `mockImplementation`, asserts on it, then calls `mockReset()`.
beforeEach(() => {
  vi.spyOn(console, 'error');
  vi.spyOn(console, 'warn');
});

afterEach(() => {
  cleanup();
  const output = [
    ...vi.mocked(console.error).mock.calls.map((args: unknown[]) => ['error', ...args]),
    ...vi.mocked(console.warn).mock.calls.map((args: unknown[]) => ['warn', ...args]),
  ];
  vi.restoreAllMocks();
  if (output.length > 0) {
    throw new Error(
      `Unexpected console output:\n${output.map((args) => args.join(' ')).join('\n')}`
    );
  }
});
