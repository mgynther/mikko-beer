import { randomBytes } from 'node:crypto'

import { scrypt } from './internal/crypto.js'

import type { log } from './log.js'

export async function encryptSecret(log: log, secret: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${await scrypt(log, secret, salt)}`
}

export async function verifySecret(
  log: log,
  secret: string,
  hash: string,
): Promise<boolean> {
  const [salt, secretHash] = hash.split(':')
  return (await scrypt(log, secret, salt)) === secretHash
}
