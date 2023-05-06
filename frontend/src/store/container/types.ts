export interface ContainerRequest {
  type: string
  size: string
}

export interface Container {
  id: string
  type: string
  size: string
}

export interface ContainerList {
  containers: Container[]
}

export enum ContainerTags {
  Container = 'Container'
}

export function containerTagTypes (): string[] {
  return [ContainerTags.Container]
}
