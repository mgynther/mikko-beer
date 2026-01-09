export function isSizeValid (size: string): boolean {
  return /^[0-9].[0-9]{2}$/v.test(size.trim())
}
