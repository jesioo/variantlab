import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  tsconfig: 'tsconfig.lib.json',
  dts: true,
  sourcemap: true,
  // Variants components use hooks, so React Server Components must treat the bundle as client code.
  banner: { js: "'use client';" },
  failOnWarn: true,
  publint: true,
  attw: { profile: 'esm-only' },
});
