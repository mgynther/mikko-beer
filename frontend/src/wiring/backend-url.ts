// The url of the backend comes from the build, and every way the application
// is built or started sets it. A build without one is a mistake, so it stops
// the application rather than letting it guess where the backend is.
export function requireBackendUrl(configured: string | undefined): string {
  if (configured === undefined || configured === '') {
    throw new Error('VITE_BACKEND_URL is not set')
  }
  return configured
}
