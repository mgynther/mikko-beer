import type { StatsStore } from '../src/storehooks/stats/types'
import { dontCall } from './dont-call'

// The stats hook takes all nine store functions at once, while a test drives
// one kind of statistics at a time. The rest must not be called, and say so by
// being dontCall, the same way test-util/stats-validators.ts does for the
// validators.
export function statsStore(overrides: Partial<StatsStore>): StatsStore {
  return {
    annual: dontCall,
    annualContainer: dontCall,
    brewery: dontCall,
    breweryCountry: dontCall,
    container: dontCall,
    location: dontCall,
    overall: dontCall,
    rating: dontCall,
    style: dontCall,
    ...overrides,
  }
}
