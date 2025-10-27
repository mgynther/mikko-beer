namespace NodeJS {
  interface ProcessEnv {
    readonly TEST_PORT_START: string | undefined;
    readonly VITEST_WORKER_ID: string | undefined;
  }
}
