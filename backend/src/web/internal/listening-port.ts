type ServerAddress = { port: number } | string | null

export function listeningPort(address: ServerAddress): number {
  if (address === null) {
    throw new Error('server is not listening')
  }
  if (typeof address === 'string') {
    throw new Error(`server listens on a pipe, not a port: ${address}`)
  }
  return address.port
}
