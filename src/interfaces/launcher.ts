export interface LauncherOptions {
    version: string,
    dirName?: string
    username?: string,
    password?: string
    maxMemory?: string
    minMemory?: string
    url?: string
    verify?: boolean
    loader?: Loader
}

export interface Cache {
    lastUsername: string
    lastVersion: string
}
export interface MineAPI {
    lastet: {
        release: string
        snapshot: string
    }
    versions: version[]
}

type version = {
    id: string
    type: string
    url: string
    time: string
    releaseTime: string
    sha1: string
    compilanceLevel: number
}

export interface Loader {
    build?: string
    enable?: boolean
    type?: string
  }

export interface Cache {
    usernames: string[]
}

export interface FabricAPI {
    version: string
    stable: boolean
}

export interface Config {
    dir: string
    memory: {
        max: string
        min: string
    }
    javaPath?: string
    width: number
    height: number
    fullScreen: boolean
}

export interface ConfigPage {
    pageName: string
}

export interface AccountCreate {
    access_token: string,
    client_token:string,
    uuid: string,
    name: string,
    user_properties: {},
    meta: {
        type: string,
        online: boolean
    }
}

export interface ForgeAPI {
    
}

type QuiltAPIGAME = {
    version: string,
    stable: boolean
}
export interface QuiltAPI {
    game: QuiltAPIGAME[]
}

export type Events = {
    error: (error: Error) => void;
    "update-found": () => void;
    "downloading-zip": () => void;
    "update-notavaliable": () => void;
    "download-completed": () => void;
    "unpacking": () => void
    "copy": () => void
    "finished": () => void;
  };