const backendUrl =
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * async required by interface.
   */
  (import.meta.env.VITE_BACKEND_URL as string | undefined)
    ?? 'http://localhost:3001'

export {
  backendUrl
}
