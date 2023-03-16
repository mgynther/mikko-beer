export interface Style {
  id: string
  name: string
}

export type StyleMap = Record<string, Style>

export interface StyleList {
  styles: Style[]
}

export enum StyleTags {
  Style = 'Style'
}

export function styleTagTypes (): string[] {
  return [StyleTags.Style]
}
