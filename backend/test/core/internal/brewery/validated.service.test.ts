import * as breweryService from '../../../../src/core/internal/brewery/validated.service'

import type {
  Brewery,
  NewBrewery,
  UpdateBreweryRequest
} from '../../../../src/core/brewery'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidBreweryError,
  invalidBreweryIdError
} from '../../../../src/core/errors'

const validCreateBreweryRequest: NewBrewery = {
  name: 'Koskipanimo'
}

const validUpdateBreweryRequest: UpdateBreweryRequest = {
  name: 'Koskipanimo',
}

const brewery: Brewery = {
  id: 'cac161f5-2792-4fbb-a251-4305ee39f350',
  name: validCreateBreweryRequest.name
}

const invalidBreweryRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (brewery: NewBrewery) => Promise<Brewery> = async () => brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

describe('brewery validated service unit tests', () => {
  it('create brewery', async () => {
    await breweryService.createBrewery(create, validCreateBreweryRequest, log)
  })

  it('fail to create invalid brewery', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(create, invalidBreweryRequest, log)
    }, invalidBreweryError)
  })

  it('update brewery', async () => {
    await breweryService.updateBrewery(
      update,
      brewery.id,
      validUpdateBreweryRequest,
      log
    )
  })

  it('fail to update invalid brewery', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        brewery.id,
        invalidBreweryRequest,
        log
      )
    }, invalidBreweryError)
  })

  it('fail to update brewery with undefined id', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        undefined,
        validUpdateBreweryRequest,
        log
      )
    }, invalidBreweryIdError)
  })

})
