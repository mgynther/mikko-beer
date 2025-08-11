import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../../../src/core/location/location'
import { locationNotFoundError } from '../../../../src/core/errors'
import type { Pagination } from '../../../../src/core/pagination'
import type { SearchByName } from '../../../../src/core/search'
import * as locationService from '../../../../src/core/internal/location/service'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'

const location: Location = {
  id: '6512b741-a387-437d-ae97-4131aca72641',
  name: 'Kuja Beer Shop & Bar',
}

describe('location service unit tests', () => {
  it('create location', async () => {
    const request: CreateLocationRequest = {
      name: location.name,
    }
    const create = async (newLocation: CreateLocationRequest) => {
      const result = {
        id: location.id,
        name: location.name,
      }
      assertDeepEqual(newLocation, { name: location.name })
      return result
    }
    const result = await locationService.createLocation(create, request, log)
    assertDeepEqual(result, {
      ...request,
      id: location.id
    })
  })

  it('update location', async () => {
    const request: UpdateLocationRequest = {
      name: location.name,
    }
    const update = async (location: Location) => {
      const result = {
        id: location.id,
        name: location.name,
      }
      assertDeepEqual(location, result)
      return result
    }
    const result = await locationService.updateLocation(
      update,
      location.id,
      request,
      log
    )
    assertDeepEqual(result, {
      ...request,
      id: location.id
    })
  })

  it('find location', async () => {
    const finder = async (locationId: string) => {
      assert.equal(locationId, location.id)
      return location
    }
    const result = await locationService.findLocationById(finder, location.id, log)
    assert.equal(result, location)
  })

  it('fail to find location with unknown id', async () => {
    const id = 'fe7bd6e4-321a-4614-9ccf-7568491841e3'
    const finder = async (searchId: string) => {
      assert.equal(searchId, id)
      return undefined
    }
    expectReject(async () => {
      await locationService.findLocationById(finder, id, log)
    }, locationNotFoundError(id))
  })

  it('list locations', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      assertDeepEqual(listPagination, pagination)
      return [location]
    }
    const result = await locationService.listLocations(lister, pagination, log)
    assertDeepEqual(result, [location])
  })

  it('search locations', async () => {
    const searchByName: SearchByName = {
      name: 'Kuj',
    }
    const searcher = async (search: SearchByName) => {
      assert.equal(search, searchByName)
      return [location]
    }
    const result = await locationService.searchLocations(
      searcher,
      searchByName,
      log
    )
    assertDeepEqual(result, [location])
  })
})
