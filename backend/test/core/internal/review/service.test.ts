import { expect } from 'earl'
import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  referredStorageNotFoundError,
  reviewNotFoundError
} from '../../../../src/core/errors'
import type {
  CreateIf,
  CreateReviewRequest,
  JoinedReview,
  NewReview,
  Review,
  ReviewListOrder,
  UpdateIf,
  UpdateReviewRequest
} from '../../../../src/core/review'
import type { Pagination } from '../../../../src/core/pagination'
import * as reviewService from '../../../../src/core/internal/review/service'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'

const time = '2024-07-06T19:36:38.182Z'

const newReview: NewReview = {
  additionalInfo: 'something interesting',
  beer: 'f796e263-650e-4044-b5c9-9f550b97aa5a',
  container: '7bf36e1b-f740-42a6-8318-72acbcee74db',
  location: '',
  rating: 8,
  time: new Date(time),
  smell: 'good',
  taste: 'tasty'
}

const createReviewRequest: CreateReviewRequest = {
  ...newReview,
  time: new Date(time).toISOString()
}

const review: Review = {
  ...newReview,
  id: '8cb936ee-77d7-46ed-89e1-4ca25bbd0416',
}

const updateReviewRequest: UpdateReviewRequest = {
  ...review,
  time: new Date(time).toISOString()
}

const joinedReview: JoinedReview = {
  ...review,
  beerId: '9ac340c5-795e-4b4a-828e-47feb2868fc8',
  beerName: 'Smoky Road',
  breweries: [{
    id: 'dfa48fab-3f6a-417c-9026-ca50ed4f5f8c',
    name: 'Mallassepät',
  }],
  container: {
    id: '65c44eda-b072-450e-a032-04c024d8b405',
    type: 'draft',
    size: '0.1',
  },
  styles: [{
    id: '6481c189-dc9a-45c0-b8ab-c7577db72b1c',
    name: 'rauch',
  }],
}

const order: ReviewListOrder = {
  property: 'rating',
  direction: 'desc'
}

const pagination: Pagination = {
  size: 10,
  skip: 80
}

const lockBeer = async (
  beerId: string
): Promise<string | undefined> => {
  expect(beerId).toEqual(review.beer)
  return review.beer
}

const lockContainer = async (
  containerId: string
): Promise<string | undefined> => {
  expect(containerId).toEqual(review.container)
  return review.container
}

const storageId = '1e90c440-73d4-4de4-bc31-c267df3e8d46'

const lockStorage = async (
  lockStorageId: string
): Promise<string | undefined> => {
  expect(lockStorageId).toEqual(storageId)
  return storageId
}

const createReview = async (newReview: NewReview) => {
  expect({
    ...newReview,
    time: newReview.time.toISOString()
  }).toEqual(createReviewRequest)
  return { ...review }
}

const updateReview = async (review: Review) => {
  expect({
    ...review,
    time: review.time.toISOString()
  }).toLooseEqual(updateReviewRequest)
  return { ...review }
}

async function notCalled(): Promise<undefined> {
  throw new Error('must not be called')
}

describe('review service unit tests', () => {
  it('create review', async () => {
    const createIf: CreateIf = {
      createReview,
      deleteFromStorage: notCalled,
      lockBeer,
      lockContainer,
      lockStorage: notCalled
    }
    const result = await reviewService.createReview(
      createIf,
      createReviewRequest,
      undefined,
      log
    )
    expect(result).toEqual({
      ...createReviewRequest,
      id: review.id,
      time: new Date(createReviewRequest.time)
    })
  })

  it('fail to create review with invalid beer', async () => {
    const createIf: CreateIf = {
      createReview,
      deleteFromStorage: notCalled,
      lockBeer: async () => undefined,
      lockContainer,
      lockStorage: notCalled
    }
    expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        undefined,
        log
      )
    }, referredBeerNotFoundError)
  })

  it('fail to create review with invalid container', async () => {
    const createIf: CreateIf = {
      createReview,
      deleteFromStorage: notCalled,
      lockBeer,
      lockContainer: async () => undefined,
      lockStorage: notCalled
    }
    expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        undefined,
        log
      )
    }, referredContainerNotFoundError)
  })

  it('create review from storage', async () => {
    let deletedFromStorage = false
    const create = async (newReview: NewReview) => {
      expect(deletedFromStorage).toEqual(false)
      return createReview(newReview)
    }
    const deleteFromStorage = async (deleteId: string) => {
      expect(deletedFromStorage).toEqual(false)
      deletedFromStorage = true
      expect(deleteId).toEqual(storageId)
    }
    const createIf: CreateIf = {
      createReview: create,
      deleteFromStorage,
      lockBeer,
      lockContainer,
      lockStorage,
    }
    const result = await reviewService.createReview(
      createIf,
      createReviewRequest,
      storageId,
      log
    )
    expect(result).toEqual({
      ...createReviewRequest,
      id: review.id,
      time: new Date(createReviewRequest.time)
    })
    expect(deletedFromStorage).toEqual(true)
  })

  it('fail to create review with invalid storage', async () => {
    const createIf: CreateIf = {
      createReview,
      deleteFromStorage: notCalled,
      lockBeer,
      lockContainer,
      lockStorage: async () => undefined
    }
    expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        storageId,
        log
      )
    }, referredStorageNotFoundError)
  })

  it('update review', async () => {
    const updateIf: UpdateIf = {
      updateReview,
      lockBeer,
      lockContainer,
    }
    const result = await reviewService.updateReview(
      updateIf,
      review.id,
      updateReviewRequest,
      log
    )
    expect(result).toEqual({
      ...updateReviewRequest,
      id: review.id,
      time: new Date(updateReviewRequest.time)
    })
  })

  it('fail to update review with invalid beer', async () => {
    const updateIf: UpdateIf = {
      updateReview,
      lockBeer: async () => undefined,
      lockContainer,
    }
    expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        review.id,
        updateReviewRequest,
        log
      )
    }, referredBeerNotFoundError)
  })

  it('fail to update review with invalid container', async () => {
    const updateIf: UpdateIf = {
      updateReview,
      lockBeer,
      lockContainer: async () => undefined,
    }
    expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        review.id,
        updateReviewRequest,
        log
      )
    }, referredContainerNotFoundError)
  })

  it('find review', async () => {
    const finder = async (reviewId: string) => {
      expect(reviewId).toEqual(review.id)
      return review
    }
    const result = await reviewService.findReviewById(finder, review.id, log)
    expect(result).toEqual(review)
  })

  it('not find review with unknown id', async () => {
    const id = '544369e2-f10b-4799-9b67-527731a78011'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
      return undefined
    }
    expectReject(async () => {
      await reviewService.findReviewById(finder, id, log)
    }, reviewNotFoundError(id))
  })

  it('list reviews', async () => {
    const lister = async (listPagination: Pagination, listOrder: ReviewListOrder) => {
      expect(listPagination).toEqual(pagination)
      expect(listOrder).toEqual(order)
      return [joinedReview]
    }
    const result = await reviewService.listReviews(
      lister,
      pagination,
      order,
      log
    )
    expect(result).toEqual([joinedReview])
  })

  it('list reviews by beer', async () => {
    const beerId = 'ff16b2f6-7862-4e55-9ecb-b67d617e8f9c'
    const lister = async (listBeerId: string, listOrder: ReviewListOrder) => {
      expect(listBeerId).toEqual(beerId)
      expect(listOrder).toEqual(order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByBeer(
      lister,
      beerId,
      order,
      log
    )
    expect(result).toEqual([joinedReview])
  })

  it('list reviews by brewery', async () => {
    const breweryId = 'f7471dfd-9af9-4a9b-b39d-47f4e7199800'
    const lister = async (listBreweryId: string, listOrder: ReviewListOrder) => {
      expect(listBreweryId).toEqual(breweryId)
      expect(listOrder).toEqual(order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByBrewery(
      lister,
      breweryId,
      order,
      log
    )
    expect(result).toEqual([joinedReview])
  })

  it('list reviews by style', async () => {
    const styleId = 'b265c454-6842-415b-840c-bfdb579aa658'
    const lister = async (listStyleId: string, listOrder: ReviewListOrder) => {
      expect(listStyleId).toEqual(styleId)
      expect(listOrder).toEqual(order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByStyle(
      lister,
      styleId,
      order,
      log
    )
    expect(result).toEqual([joinedReview])
  })
})
