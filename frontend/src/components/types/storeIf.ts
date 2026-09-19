import type {
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerLoginIf,
} from './beer/types'
import type {
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf,
} from './brewery/types'
import type { ListContainersIf, UpdateContainerIf } from './container/types'
import type {
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf,
} from './location/types'
import type {
  ChangePasswordIf,
  GetLogin,
  LoginIf,
  LogoutIf,
} from './login/types'
import type {
  CreateReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  ReviewIf,
} from './review/types'
import type { SearchFieldIf } from './search/types'
import type { StatsIf } from './stats/types'
import type {
  CreateStorageIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf,
  StorageStatsIf,
} from './storage/types'
import type { GetStyleIf, ListStylesIf, UpdateStyleIf } from './style/types'
import type { UserIf } from './user/types'
import type { NavMenuIf, ThemeIf } from './types'

export interface StoreIf {
  getLogin: GetLogin

  navMenuIf: NavMenuIf
  themeIf: ThemeIf

  getBeerIf: GetBeerIf
  listBeersIf: ListBeersIf
  searchBeerIf: SearchBeerIf
  selectBeerIf: SelectBeerIf
  updateBeerLoginIf: UpdateBeerLoginIf

  getBreweryIf: GetBreweryIf
  listBreweriesIf: ListBreweriesIf
  searchBreweryIf: SearchBreweryIf
  updateBreweryIf: UpdateBreweryIf

  listContainersIf: ListContainersIf
  reviewContainerIf: ReviewContainerIf
  updateContainerIf: UpdateContainerIf

  getLocationIf: GetLocationIf
  listLocationsIf: ListLocationsIf
  searchLocationIf: SearchLocationIf
  updateLocationIf: UpdateLocationIf

  changePasswordIf: ChangePasswordIf
  loginIf: LoginIf
  logoutIf: LogoutIf

  createReviewIf: CreateReviewIf
  listReviewsIf: ListReviewsIf
  listReviewsByBeerIf: ListReviewsByIf
  listReviewsByBreweryIf: ListReviewsByIf
  listReviewsByLocationIf: ListReviewsByIf
  listReviewsByStyleIf: ListReviewsByIf
  reviewIf: ReviewIf

  statsIf: StatsIf

  searchFieldIf: SearchFieldIf

  createStorageIf: CreateStorageIf
  getStorageIf: GetStorageIf
  listStoragesIf: ListStoragesIf
  listStoragesByBeerIf: ListStoragesByIf
  listStoragesByBreweryIf: ListStoragesByIf
  listStoragesByStyleIf: ListStoragesByIf
  storageStatsIf: StorageStatsIf

  getStyleIf: GetStyleIf
  listStylesIf: ListStylesIf
  updateStyleIf: UpdateStyleIf

  userIf: UserIf
}
