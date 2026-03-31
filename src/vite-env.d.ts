/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare module "virtual:pwa-register" {
  export function registerSW(options?: { immediate?: boolean }): void;
}
