import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

export interface BeerTable {
  beer_id: Generated<string>
  name: string | null
  created_at: Generated<Date>
}

export interface BeerBreweryTable {
  beer: Generated<string>
  brewery: Generated<string>
}

export interface BeerStyleTable {
  beer: Generated<string>
  style: Generated<string>
}

export type BeerRow = Selectable<BeerTable>

export type InsertableBeerRow = Insertable<BeerTable>
export type UpdateableBeerRow = Updateable<BeerTable>

export type BeerBreweryRow = Selectable<BeerBreweryTable>
export type InsertableBeerBreweryRow = Insertable<BeerBreweryTable>

export type BeerStyleRow = Selectable<BeerStyleTable>
export type InsertableBeerStyleRow = Insertable<BeerStyleTable>
