import type {
  CreateStyleRequest,
  UpdateStyleRequest,
} from './internal/style/requests'
import {
  useCreateStyleMutation,
  useGetStyleQuery,
  useListStylesQuery,
  useUpdateStyleMutation,
} from './internal/style/api'

// The public surface of the style endpoints. See store/beer.ts for why every
// result is built here rather than handed on as the query hook returned it.
export interface GetStyleResult {
  data: unknown
  isLoading: boolean
}

export interface ListStylesResult {
  data: unknown
  isLoading: boolean
}

// Creating a style does not unwrap its response: the form that calls it reads
// the outcome from hasError and isSuccess rather than from a rejection.
export interface CreateStyleResult {
  create: (style: CreateStyleRequest) => Promise<void>
  data: unknown
  hasError: boolean
  isLoading: boolean
  isSuccess: boolean
}

export interface UpdateStyleResult {
  update: (style: UpdateStyleRequest) => Promise<unknown>
  hasError: boolean
  isLoading: boolean
  isSuccess: boolean
}

export function useGetStyle(styleId: string): GetStyleResult {
  const { data, isLoading } = useGetStyleQuery(styleId)
  return {
    data,
    isLoading,
  }
}

export function useListStyles(): ListStylesResult {
  const { data, isLoading } = useListStylesQuery()
  return {
    data,
    isLoading,
  }
}

export function useCreateStyle(): CreateStyleResult {
  const [createStyle, { data, isError, isLoading, isSuccess }] =
    useCreateStyleMutation()
  return {
    create: async (style: CreateStyleRequest): Promise<void> => {
      await createStyle(style)
    },
    data,
    hasError: isError,
    isLoading,
    isSuccess,
  }
}

export function useUpdateStyle(): UpdateStyleResult {
  const [updateStyle, { isError, isLoading, isSuccess }] =
    useUpdateStyleMutation()
  return {
    update: async (style: UpdateStyleRequest): Promise<unknown> =>
      await updateStyle(style).unwrap(),
    hasError: isError,
    isLoading,
    isSuccess,
  }
}
