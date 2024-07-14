export interface CreateStyleRequest {
  name: string
  parents: string[]
}

export interface Style {
  id: string
  name: string
}

export interface StyleWithParentIds extends Style {
  parents: string[]
}

export interface StyleWithParents extends Style {
  parents: Style[]
}

export interface StyleWithParentsAndChildren extends Style {
  children: Style[]
  parents: Style[]
}

export interface StyleList {
  styles: StyleWithParentIds[]
}

export interface CreateStyleIf {
  useCreate: () => {
    create: (style: CreateStyleRequest) => Promise<void>
    createdStyle: Style | undefined
    hasError: boolean
    isLoading: boolean
    isSuccess: boolean
  }
}

export interface GetStyleIf {
  useGet: (styleId: string) => {
    style: StyleWithParentsAndChildren | undefined
    isLoading: boolean
  }
}

export interface ListStylesIf {
  useList: () => {
    styles: StyleWithParentIds[] | undefined
    isLoading: boolean
  }
}

export interface SelectStyleIf {
  create: CreateStyleIf,
  list: ListStylesIf
}

export interface UpdateStyleIf {
  useUpdate: () => {
    update: (style: StyleWithParentIds) => Promise<void>
    hasError: boolean
    isLoading: boolean
    isSuccess: boolean
  }
}
