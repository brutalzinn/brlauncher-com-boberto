import { Loader } from "./launcher"

export interface BobertoModpackCustom {
  id: string
  name: string
  gameVersion: string
  metadata: BobertoMetadata
}

export interface BobertoMetadata {
  modpack: BobertoModpack
}

export interface BobertoModpack {
  manifest: string
  isDefault: string
  loader: BobertoLoader
  thumb: string
  verify: string
}

export interface BobertoLoader {
  build?: string
  enable?: string
  type?: string
}

