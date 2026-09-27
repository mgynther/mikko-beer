import type { ScryptParameters } from '../crypto/scrypt-parameters.js'

export const passwordHashParameters: ScryptParameters = { N: 32768, r: 8, p: 3 }
