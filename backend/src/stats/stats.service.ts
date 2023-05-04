import * as statsRepository from './stats.repository'

import { type Database } from '../database'
import { type Stats } from './stats'

export async function getStats (
  db: Database
): Promise<Stats> {
  return await statsRepository.getStats(db)
}
