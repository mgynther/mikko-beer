import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import { isSizeValid } from '../../../../src/components/internal/container/util'
;['0.10', '0.25', '0.33', '0.44', '0.50', '1.00'].forEach((size: string) => {
  test(`container size "${size}" is valid`, () => {
    assertEqual(isSizeValid(size), true)
  })
})
;['', 'abc', '0.a3'].forEach((size) => {
  test(`container size "${size}" is invalid`, () => {
    assertEqual(isSizeValid(size), false)
  })
})
