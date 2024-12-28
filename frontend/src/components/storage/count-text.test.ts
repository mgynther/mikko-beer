import { expect, test } from "vitest"

import { countText } from '../../components/storage/count-text'
import type { Storage } from '../../core/storage/types'

const ipaStorage: Storage = {
  id: 'e90dd689-c5c0-4972-a795-ce45d56c925b',
  beerId: '40c87723-616d-4911-ac92-1a99b5853722',
  beerName: 'CCCCC IPA',
  bestBefore: '2024-12-31T12:00:00.000Z',
  breweries: [{
    id: '7afad577-9d35-438b-8819-3fb6a17072d1',
    name: 'Beer Hunters'
  }],
  createdAt: '2024-11-08T12:00:00.000Z',
  container: {
    id: '7493be5d-f4f1-40b2-8c6b-05dad4adad8b',
    type: 'bottle',
    size: '0.50'
  },
  hasReview: false,
  styles: [{
    id: 'c9b433b0-b9a3-46dc-9421-ee9dcafa10f0',
    name: 'American IPA'
  }]
}

const stoutOneStorage: Storage = {
  id: '3bbdf1cc-4092-4401-ab1c-5e06477fda06',
  beerId: 'b4b6e37e-40b4-4cca-9345-09f73898f601',
  beerName: 'Ukontuli',
  bestBefore: '2023-09-25T12:00:00.000Z',
  breweries: [{
    id: 'a1230a9b-52b1-41eb-9759-e0023e25aa95',
    name: 'Iso-Kallan Panimo'
  }],
  createdAt: '2021-10-07T12:00:00.000Z',
  container: {
    id: '12c992c2-47d2-43f0-91f5-36d6a06857f8',
    type: 'bottle',
    size: '0.33'
  },
  hasReview: false,
  styles: [{
    id: 'f0e31bea-8421-4d6a-bf8a-41796238813f',
    name: 'Imperial Stout'
  }]
}

const stoutTwoStorage: Storage = {
  id: 'ce7191be-8556-479b-b3d1-48c11641ed97',
  beerId: '4ccacd6b-e736-4243-9a2f-35f901fc64da',
  beerName: 'Põlev Jõgi Whiskey Barrel Aged',
  bestBefore: '2024-12-31T12:00:00.000Z',
  breweries: [
    {
      id: 'c40d72d1-4c93-4bdd-8ec8-012dc0f95582',
      name: 'Lehe Pruulikoda'
    },
    {
      id: '73d6e4ea-8b24-4e88-bf83-effd1ab88702',
      name: 'Pühaste'
    }
  ],
  createdAt: '2023-03-15T12:00:00.000Z',
  container: {
    id: '1214723e-9c08-4a84-8f65-3d8b16caa845',
    type: 'bottle',
    size: '0.33'
  },
  hasReview: false,
  styles: [{
    id: '094ce408-05d0-4f0f-a7c6-0e5496d485ac',
    name: 'Imperial Stout'
  }]
}

test('format storage count text', () => {
  const storages: Storage[] = [
    { ...ipaStorage, hasReview: true },
    { ...stoutOneStorage, hasReview: false },
    { ...stoutTwoStorage, hasReview: false }
  ]
  expect(countText(storages)).toEqual('2/3')
})
