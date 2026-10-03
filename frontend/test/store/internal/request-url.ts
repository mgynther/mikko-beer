export function requestUrl(url: string | undefined): string {
  if (url === undefined) {
    throw new Error('request has no url')
  }
  return url
}
