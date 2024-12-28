import { expect } from 'earl'

import {
  validateCreateReviewRequest,
  validateUpdateReviewRequest,
} from '../../src/core/review'
import {
  invalidReviewError,
  invalidReviewIdError
} from '../../src/core/errors'
import { expectThrow } from './controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    additionalInfo: 'Brewed with coffee',
    beer: 'b6a7b38d-3ee3-4a0c-8f6a-97424c6c65e5',
    container: '3e4067dd-3642-475a-91d5-01f8759bc124',
    location: 'A bizarre bar',
    rating: 8,
    time: '2023-12-07T22:32:40.123+02:00',
    smell: 'piny',
    taste: 'nutty notes'
  }
}

describe('review create/update unit tests', () => {
  const id = '49f208f7-07b2-4fca-bbd3-8a4bc49b9b38';

  [
    {
      func: validateCreateReviewRequest,
      title: (base: string) => `${base}: create`,
      outputFormatter: (input: object) => input
    },
    {
      func: (request: unknown) => {
        return validateUpdateReviewRequest(request, id)
      },
      title: (base: string) => `${base}: update`,
      outputFormatter: (input: object) => ({
        id,
        request: input
      })
    }
  ].forEach(validator => {
    const { func, title, outputFormatter } = validator

    function pass (review: object) {
      const input = { ...review }
      const output = { ...review }
      expect(func(input)).toLooseEqual(outputFormatter(output))
    }

    it(title('pass validation'), () => {
      pass(validRequest())
    })

    it(title('pass with minimal info'), () => {
      const { beer, container, rating, time, smell, taste } = validRequest()
      pass({ beer, container, rating, time, smell, taste })
    })

    it(title('pass with empty additional info'), () => {
      const review = {
        ...validRequest(),
        additionalInfo: ''
      }
      pass(review)
    })

    it(title('pass with empty location'), () => {
      const review = {
        ...validRequest(),
        location: ''
      }
      pass(review)
    })

    it(title('pass with UTC time'), () => {
      const review = {
        ...validRequest(),
        time: '2023-12-07T20:32:40.123Z',
      }
      pass(review)
    })

    it(title('pass with - timezone'), () => {
      const review = {
        ...validRequest(),
        time: '2023-12-07T19:32:40.123-01:00',
      }
      pass(review)
    })

    function numberRange (start: number, end: number) {
      return Array(end - start + 1).fill(start).map((x, y) => x + y)
    }
    numberRange(4, 10).forEach(rating => it(
      title(`pass with rating ${rating}`), () => {
        const review = {
          ...validRequest(),
          rating
        }
        const input = { ...review }
        const output = { ...review }
        expect(func(input)).toLooseEqual(outputFormatter(output))
      }))

    function fail (review: unknown) {
      expectThrow(() => func(review), invalidReviewError)
    }

    it(title('fail with empty beer'), () => {
      const review = {
        ...validRequest(),
        beer: ''
      }
      fail(review)
    })

    it(title('fail without beer'), () => {
      const { container, rating, time, smell, taste } = validRequest()
      fail({ container, rating, time, smell, taste })
    })

    it(title('fail with empty container'), () => {
      const review = {
        ...validRequest(),
        container: ''
      }
      fail(review)
    })

    it(title('fail without container'), () => {
      const { beer, rating, time, smell, taste } = validRequest()
      fail({ beer, rating, time, smell, taste })
    })

    it(title('fail with invalid rating'), () => {
      const review = {
        ...validRequest(),
        rating: ''
      }
      fail(review)
    })

    it(title('fail without rating'), () => {
      const { beer, container, time, smell, taste } = validRequest()
      fail({ beer, container, time, smell, taste })
    })

    it(title('fail with rating below range'), () => {
      const review = {
        ...validRequest(),
        rating: 3
      }
      fail(review)
    })

    it(title('fail with rating above range'), () => {
      const review = {
        ...validRequest(),
        rating: 11
      }
      fail(review)
    })

    it(title('fail with non-integer rating'), () => {
      const review = {
        ...validRequest(),
        rating: 9.12
      }
      fail(review)
    })

    it(title('fail with empty smell'), () => {
      const review = {
        ...validRequest(),
        smell: ''
      }
      fail(review)
    })

    it(title('fail without smell'), () => {
      const { beer, container, rating, time, taste } = validRequest()
      fail({ beer, container, rating, time, taste })
    })

    it(title('fail with empty taste'), () => {
      const review = {
        ...validRequest(),
        taste: ''
      }
      fail(review)
    })

    it(title('fail without taste'), () => {
      const { beer, container, rating, time, smell } = validRequest()
      fail({ beer, container, rating, time, smell })
    })

    it(title('fail with additional property'), () => {
      const review = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(review)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateReviewRequest(validRequest(), '')
    , invalidReviewIdError)
  })
})
