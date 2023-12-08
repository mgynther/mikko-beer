import { expect } from 'chai'

import { validateStatsFilter } from '../../../src/core/stats/stats'

describe('stats filter unit tests', () => {
  it('validate undefined filter', () => {
    expect(validateStatsFilter(undefined)).to.equal(undefined)
  })

  it('validate empty filter', () => {
    expect(validateStatsFilter({})).to.equal(undefined)
  })

  it('validate brewery filter', () => {
    expect(
      validateStatsFilter({ brewery: 'testing' })
    ).to.eql({ brewery: 'testing' })
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsFilter({ brewery: 123 })).to.equal(undefined)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsFilter({ additional: 'testing' })).to.equal(undefined)
  })
})
