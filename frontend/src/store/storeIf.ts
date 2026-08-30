import type {
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerLoginIf,
} from '../types/beer/types'
import type {
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf,
} from '../types/brewery/types'
import type {
  ListContainersIf,
  UpdateContainerIf,
} from '../types/container/types'
import type {
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf,
} from '../types/location/types'
import type {
  ChangePasswordIf,
  GetLogin,
  LoginIf,
  LogoutIf,
} from '../types/login/types'
import type {
  CreateReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  ReviewIf,
} from '../types/review/types'
import type { SearchFieldIf } from '../types/search/types'
import type { StatsIf } from '../types/stats/types'
import type {
  CreateStorageIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf,
  StorageStatsIf,
} from '../types/storage/types'
import type {
  GetStyleIf,
  ListStylesIf,
  UpdateStyleIf,
} from '../types/style/types'
import type { UserIf } from '../types/user/types'

export interface StoreIf {
  getLogin: GetLogin

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
