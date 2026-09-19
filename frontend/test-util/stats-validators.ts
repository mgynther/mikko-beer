import type { StatsValidators } from '../src/storehooks/stats/types'
import { dontCall } from './dont-call'

// The stats hook takes all thirteen validators at once, while a test drives
// one kind of statistics at a time. The rest must not be called, and say so
// by being dontCall: a test that reaches one of them has wired something it
// did not mean to.
export function statsValidators(
  overrides: Partial<StatsValidators>,
): StatsValidators {
  return {
    annualOrUndefined: dontCall,
    annualContainer: dontCall,
    annualContainerOrUndefined: dontCall,
    breweryCountry: dontCall,
    breweryCountryOrUndefined: dontCall,
    brewery: dontCall,
    breweryOrUndefined: dontCall,
    containerOrUndefined: dontCall,
    location: dontCall,
    locationOrUndefined: dontCall,
    overallOrUndefined: dontCall,
    ratingOrUndefined: dontCall,
    styleOrUndefined: dontCall,
    ...overrides,
  }
}
