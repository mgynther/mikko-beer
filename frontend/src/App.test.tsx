import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import LinkWrapper from './components/LinkWrapper'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'
import type { StoreIf } from './store/storeIf'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dontCall = (): any => {
  throw new Error('must not be called')
}

test('renders app', () => {
  const storeIf: StoreIf = {
    getBeerIf: {
      useGetBeer: dontCall
    },
    listBeersIf: {
      useList: dontCall,
      infiniteScroll: dontCall
    },
    searchBeerIf: {
      useSearch: dontCall
    },
    selectBeerIf: {
      create: {
        useCreate: dontCall,
        editBeerIf: {
          selectBreweryIf: {
            create: {
              useCreate: dontCall
            },
            search: {
              useSearch: dontCall
            }
          },
          selectStyleIf: {
            create: {
              useCreate: dontCall
            },
            list: {
              useList: dontCall
            }
          }
        }
      },
      search: {
        useSearch: dontCall
      }
    },
    updateBeerIf: {
      useUpdate: dontCall,
      editBeerIf: {
        selectBreweryIf: {
          create: {
            useCreate: dontCall
          },
          search: {
            useSearch: dontCall
          }
        },
        selectStyleIf: {
          create: {
            useCreate: dontCall
          },
          list: {
            useList: dontCall
          }
        }
      }
    },
    getBreweryIf: {
      useGet: dontCall
    },
    listBreweriesIf: {
      useList: dontCall,
      infiniteScroll: dontCall
    },
    searchBreweryIf: {
      useSearch: dontCall
    },
    updateBreweryIf: {
      useUpdate: dontCall
    },
    listContainersIf: {
      useList: dontCall
    },
    reviewContainerIf: {
      createIf: {
        useCreate: dontCall
      },
      listIf: {
        useList: dontCall
      }
    },
    updateContainerIf: {
      useUpdate: dontCall
    },
    changePasswordIf: {
      useChangePassword: dontCall,
      useGetPasswordChangeResult: dontCall
    },
    loginIf: {
      useLogin: () => ({
        login: dontCall,
        isLoading: false
      })
    },
    logoutIf: {
      useLogout: () => ({
        logout: dontCall
      })
    },
    createReviewIf: {
      useCreate: dontCall,
      getCurrentDate: dontCall,
      selectBeerIf: {
        create: {
          useCreate: dontCall,
          editBeerIf: {
            selectBreweryIf: {
              create: {
                useCreate: dontCall
              },
              search: {
                useSearch: dontCall
              }
            },
            selectStyleIf: {
              create: {
                useCreate: dontCall
              },
              list: {
                useList: dontCall
              }
            }
          }
        },
        search: {
          useSearch: dontCall
        }
      },
      reviewContainerIf: {
        createIf: {
          useCreate: dontCall
        },
        listIf: {
          useList: dontCall
        }
      }
    },
    listReviewsIf: {
      useList: dontCall
    },
    listReviewsByBeerIf: {
        useList: dontCall
    },
    listReviewsByBreweryIf: {
      useList: dontCall
    },
    listReviewsByStyleIf: {
      useList: dontCall
    },
    reviewIf: {
      get: {
        useGet: dontCall
      },
      update: {
        useUpdate: dontCall,
        selectBeerIf: {
          create: {
            useCreate: dontCall,
            editBeerIf: {
              selectBreweryIf: {
                create: {
                  useCreate: dontCall
                },
                search: {
                  useSearch: dontCall
                }
              },
              selectStyleIf: {
                create: {
                  useCreate: dontCall
                },
                list: {
                  useList: dontCall
                }
              }
            }
          },
          search: {
            useSearch: dontCall
          }
        },
        reviewContainerIf: {
          createIf: {
            useCreate: dontCall
          },
          listIf: {
            useList: dontCall
          }
        }
      },
      login: () => ({
        user: undefined,
        authToken: '',
        refreshToken: ''
      })
    },
    statsIf: {
      annual: {
        useStats: dontCall
      },
      brewery: {
        useStats: dontCall,
        infiniteScroll: dontCall
      },
      overall: {
        useStats: dontCall
      },
      rating: {
        useStats: dontCall
      },
      style: {
        useStats: dontCall
      }
    },
    searchIf: {
      useSearch: dontCall,
      useDebounce: dontCall
    },
    createStorageIf: {
      useCreate: dontCall
    },
    getStorageIf: {
      useGet: dontCall
    },
    listStoragesIf: {
      useList: dontCall
    },
    listStoragesByBeerIf: {
      useList: dontCall
    },
    listStoragesByBreweryIf: {
      useList: dontCall
    },
    listStoragesByStyleIf: {
      useList: dontCall
    },
    getStyleIf: {
      useGet: dontCall
    },
    listStylesIf: {
      useList: dontCall
    },
    updateStyleIf: {
      useUpdate: dontCall
    },
    userIf: {
      create: {
        useCreate: dontCall
      },
      list: {
        useList: dontCall
      },
      delete: {
        useDelete: dontCall
      }
    }
  }
  const { getByRole } = render(
    <Provider store={store}>
      <LinkWrapper>
        <App storeIf={storeIf} />
      </LinkWrapper>
    </Provider>
  )
  const loginButton = getByRole('button', { name: 'Login' })
  expect(loginButton).toBeDefined()
})
