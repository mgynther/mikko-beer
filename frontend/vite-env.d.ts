interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string | undefined
  // vitest merges the process environment into import.meta.env; in a
  // browser build these are simply undefined.
  readonly TEST_PORT_START: string | undefined
  readonly VITEST_POOL_ID: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
