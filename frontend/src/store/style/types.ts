export interface Style {
  id: string
  name: string
}

export interface StyleList {
  styles: Style[]
}

export enum StyleTags {
  Style = 'Style'
}

export function styleTagTypes (): string[] {
  return [StyleTags.Style]
}
