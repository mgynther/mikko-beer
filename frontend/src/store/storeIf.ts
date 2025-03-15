import type {
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerIf
} from "../core/beer/types"
import type {
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf
} from "../core/brewery/types"
import type {
  ListContainersIf,
  UpdateContainerIf
} from "../core/container/types"
import type {
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf
} from "../core/location/types"
import type {
  ChangePasswordIf,
  GetLogin,
  LoginIf,
  LogoutIf
} from "../core/login/types"
import type {
  CreateReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  ReviewIf
} from "../core/review/types"
import type {
  SearchIf
} from "../core/search/types"
import type {
  StatsIf
} from "../core/stats/types"
import type {
  CreateStorageIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf
} from "../core/storage/types"
import type {
  GetStyleIf,
  ListStylesIf,
  UpdateStyleIf
} from "../core/style/types"
import type {
  UserIf
} from "../core/user/types"

export interface StoreIf {
  getLogin: GetLogin

  getBeerIf: GetBeerIf
  listBeersIf: ListBeersIf
  searchBeerIf: SearchBeerIf
  selectBeerIf: SelectBeerIf
  updateBeerIf: UpdateBeerIf

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

  searchIf: SearchIf

  createStorageIf: CreateStorageIf
  getStorageIf: GetStorageIf
  listStoragesIf: ListStoragesIf
  listStoragesByBeerIf: ListStoragesByIf
  listStoragesByBreweryIf: ListStoragesByIf
  listStoragesByStyleIf: ListStoragesByIf

  getStyleIf: GetStyleIf
  listStylesIf: ListStylesIf
  updateStyleIf: UpdateStyleIf

  userIf: UserIf
}
