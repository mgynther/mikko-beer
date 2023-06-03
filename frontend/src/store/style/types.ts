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

export interface StyleList {
  styles: StyleWithParentIds[]
}

export enum StyleTags {
  Style = 'Style'
}

export function styleTagTypes (): string[] {
  return [StyleTags.Style]
}
