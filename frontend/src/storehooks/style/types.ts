// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/ so that this layer can be changed and
// tested without types/ having been changed first. types/ declares the same
// shapes for the components and the two meet in RtkApp, which is where drift
// between them turns into a compile error.
export interface Style {
  id: string
  name: string
}

export interface StyleWithParentIds extends Style {
  parents: string[]
}

export interface StyleWithParentsAndChildren extends Style {
  children: Style[]
  parents: Style[]
}

export interface StyleList {
  styles: StyleWithParentIds[]
}

export interface CreateStyleRequest {
  name: string
  parents: string[]
}

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export type UseGetStyle = (styleId: string) => {
  data: unknown
  isLoading: boolean
}

export type UseListStyles = () => {
  data: unknown
  isLoading: boolean
}

export type UseCreateStyle = () => {
  create: (style: CreateStyleRequest) => Promise<void>
  data: unknown
  hasError: boolean
  isLoading: boolean
  isSuccess: boolean
}

export type UseUpdateStyle = () => {
  update: (style: StyleWithParentIds) => Promise<unknown>
  hasError: boolean
  isLoading: boolean
  isSuccess: boolean
}

export type ValidateStyle = (result: unknown) => Style

export type ValidateStyleOrUndefined = (result: unknown) => Style | undefined

export type ValidateStyleWithParentsAndChildrenOrUndefined = (
  result: unknown,
) => StyleWithParentsAndChildren | undefined

export type ValidateStyleListOrUndefined = (
  result: unknown,
) => StyleList | undefined

export interface CreateStyleHookIf {
  useCreate: () => {
    create: (style: CreateStyleRequest) => Promise<void>
    createdStyle: Style | undefined
    hasError: boolean
    isLoading: boolean
    isSuccess: boolean
  }
}

export interface GetStyleHookIf {
  useGet: (styleId: string) => {
    style: StyleWithParentsAndChildren | undefined
    isLoading: boolean
  }
}

export interface ListStylesHookIf {
  useList: () => {
    styles: StyleWithParentIds[] | undefined
    isLoading: boolean
  }
}

export interface UpdateStyleHookIf {
  useUpdate: () => {
    update: (style: StyleWithParentIds) => Promise<void>
    hasError: boolean
    isLoading: boolean
    isSuccess: boolean
  }
}
