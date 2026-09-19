import type {
  CreateContainerRequest,
  UpdateContainerRequest,
} from './internal/container/requests'
import {
  useCreateContainerMutation,
  useListContainersQuery,
  useUpdateContainerMutation,
} from './internal/container/api'

// The public surface of the container endpoints. See store/beer.ts for why
// every result is built here rather than handed on as the query hook returned
// it.
export interface ListContainersResult {
  data: unknown
  isLoading: boolean
}

export interface CreateContainerResult {
  create: (container: CreateContainerRequest) => Promise<unknown>
  isLoading: boolean
}

export interface UpdateContainerResult {
  update: (container: UpdateContainerRequest) => Promise<unknown>
  isLoading: boolean
}

export function useListContainers(): ListContainersResult {
  const { data, isLoading } = useListContainersQuery()
  return {
    data,
    isLoading,
  }
}

export function useCreateContainer(): CreateContainerResult {
  const [createContainer, { isLoading }] = useCreateContainerMutation()
  return {
    create: async (container: CreateContainerRequest): Promise<unknown> =>
      await createContainer(container).unwrap(),
    isLoading,
  }
}

export function useUpdateContainer(): UpdateContainerResult {
  const [updateContainer, { isLoading }] = useUpdateContainerMutation()
  return {
    update: async (container: UpdateContainerRequest): Promise<unknown> =>
      await updateContainer(container).unwrap(),
    isLoading,
  }
}
