import axios from "axios"
import { Launcher } from "./launcher.js"
import { FabricAPI, LauncherOptions, MineAPI, QuiltAPI } from "../../interfaces/launcher.js"
import { AutoUpdater } from "./autoupdater.js"
import { ipcRenderer } from "electron"
import { PageBase } from "../base.js"
import { BobertoModpackCustom } from "../../interfaces/boberto.modpack.custom.js";

class HomePage extends PageBase {
    private instance : HomePage
    private currentLauncher?: LauncherOptions
    constructor() {
        super({
            pageName: 'home'
        })
        this.instance = this
        console.log("[CLIENT SIDE] A HOME FOI CARREGADA")
    }

    async init() {
        await this.manageDropdown()
        this.initUpdater()
        const play = document.getElementById('play') as HTMLButtonElement
        play.addEventListener('click', () => {
            if(!this.currentLauncher){
                play.innerHTML = '<span class="material-icons">play_disabled</span> Nenhuma versao selecionado..'
                play.disabled = true
                return
            }
            this.startLauncher(this.currentLauncher!)
            play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...'
            play.disabled = true
        })
    }

    /* private async getInstalledVersions(){
        const launcherSettings = await LauncherDB.config()
        // if(!launcherSettings) return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.")
        let versions = readdirSync(`${launcherSettings?.path}\\versions`)
        console.log(versions)
        
    } */

    private async getNeoForgeVersions(){
        // not implemented
    }

    private async getQuiltVersions(){
        let quilt = (await (await fetch("https://meta.quiltmc.org/v3/versions")).json() as QuiltAPI).game.filter(v => v.stable).map(v => v.version)
        return quilt
    }

    private async getFabricVersions() {
        let fabric = (await (await fetch("https://meta.fabricmc.net/v2/versions/game")).json() as FabricAPI[]).filter(v => v.stable).map(v => v.version)
        return fabric
    }

    private async getVanillaVersions() {
        let vanilla = (await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json() as MineAPI).versions.filter(v => v.type === "release").map(v => v.id)
        return vanilla
    }

    private async getForgeVersions() {
        let forge = (await (await fetch("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")).json() as Object)
        return forge
        // https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json
    }

    
    private async getCustomModpacks() {
        let custom = (await (await fetch("http://localhost:3000/modpack")).json() as BobertoModpackCustom[])

        // let custom = (await (await fetch("http://api-launcher-boberto.boberto.net/modpack")).json() as BobertoModpackCustom[])
        return custom
        // https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json
    }

    private returnOptionElement(launcherOptions : LauncherOptions, bobertoIntegration?: BobertoModpackCustom) {
        const div = document.createElement('div')
        div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150')
   
        if(bobertoIntegration){
            div.innerHTML = `<img src="../core/imgs/${launcherOptions.loader?.type!}.png" width="30">${bobertoIntegration.name}`
            div.addEventListener('click', () => {
                this.currentLauncher = launcherOptions
                this.setDropdownItem(bobertoIntegration.name)
               // this.instance.startLauncher(launcherOptions)
            })
            return div
        }
        div.addEventListener('click', () => {
            this.currentLauncher = launcherOptions
            this.setDropdownItem(launcherOptions.loader?.type ?? "custom")
           // this.instance.startLauncher(launcherOptions)
        })
        div.innerHTML = `<img src="../core/imgs/${launcherOptions.loader?.type!}.png" width="30">${launcherOptions.loader?.type!} ${launcherOptions.version}`
        return div
    }

    private setDropdownItem(item: string) {
        const fake = document.getElementById('fake-select') as HTMLElement
        fake.innerHTML = `<img src="../core/imgs/${item.split(' ')[0]}.png" width="30">${item}`
        const input = document.getElementById('version') as HTMLInputElement
        input.value = item
    }

    async manageDropdown() {
        const vanilla = await this.getVanillaVersions()
        const fabric = await this.getFabricVersions()
        const forge = await this.getForgeVersions()
        const quilt = await this.getQuiltVersions()
        const customModpacks = await this.getCustomModpacks()
        // const installed = await this.getInstalledVersions()
        const options = document.getElementById('options') as HTMLElement

        for(let modpack of customModpacks){
                let config : LauncherOptions = {
                    url: modpack.metadata.modpack.manifest,
                    version: modpack.gameVersion,
                    loader: {
                        type: modpack.metadata.modpack.loader.type,
                        build: modpack.metadata.modpack.loader.build,
                        enable:  modpack.metadata.modpack.loader.enable == "true"
                    },
                    verify: modpack.metadata.modpack.verify == "true"
                }
                const customDiv = this.returnOptionElement(config, modpack)                                                                                                                                                                                                      
                options.appendChild(customDiv)
        }

        for (let version of vanilla) {
            // const installedDiv = this.returnOptionElement('installed', version)
            const forgeDiv = this.returnOptionElement({
                loader: {
                    type: "forge",
                    build: "latest",
                    enable: true
                },
                version: version
            })
            const fabricDiv = this.returnOptionElement({
                loader: {
                    type: "fabric",
                    build: "latest",
                    enable: true
                },
                version: version
            })
            const vanillaDiv = this.returnOptionElement({
                loader: {
                    enable: false
                },
                version: version
            })
            const quiltDiv = this.returnOptionElement({
                loader: {
                    type:"quilt",
                    build: "latest",
                    enable: true
                },
                version: version
            })

            options.appendChild(vanillaDiv)

            if (fabric.includes(version)) {
                options.appendChild(fabricDiv)
            }
            if (Object.keys(forge).includes(version)) {
                options.appendChild(forgeDiv)
            }
            if(quilt.includes(version)) {
                options.appendChild(quiltDiv)
            }
        }

    }

    startLauncher(options: LauncherOptions) {
        const launcher = new Launcher()
        launcher.init(options)
        const barra = document.getElementById('barra') as HTMLElement

        launcher.on("progress", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on("check", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on('extract',( extract : any)=> {
            console.log(extract);
        });

        launcher.on("error", (err: any) => {
            barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`
            // alert(JSON.stringify(err))
            console.log(err);

        })

        launcher.on('data', (data: any) => {
            barra.innerHTML = '<span class="text-lime-700">Iniciando JVM e o Minecraft</span>'
            barra.style.width = '100%'
            if (data.includes("Launching")) {
                barra.innerHTML = '<span class="text-lime-700">Jogo rodando...</span>'
                ipcRenderer.invoke("playing", `${options.loader?.type} ${options.version}`)
            }
        })

        launcher.on('close', (code: number) => {
            barra.style.width = '0%'
            const play = document.getElementById('play') as HTMLButtonElement
            play.disabled = false
            play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar'
            ipcRenderer.invoke("stopPlaying")
        })
    }

    initUpdater() {
        
        const autoUpdater = new AutoUpdater()

        const updater = document.getElementById("updater") as HTMLDivElement
        const no_button = document.getElementById("nupdate") as HTMLButtonElement
        const no_button_x = document.getElementById("close-updater") as HTMLButtonElement
        const yes_button = document.getElementById("yupdate") as HTMLButtonElement

        autoUpdater.on("update-found", () => {
            updater.classList.add('flex')
            updater.classList.remove('hidden')
            console.log('Update encontrado')
        })

        autoUpdater.on("update-notavaliable", () => console.log('O launcher já está atualizado.'))

        no_button.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        no_button_x.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        yes_button.addEventListener("click", (event) => {
            yes_button.setAttribute('disabled', 'true')

            updater.classList.add('hidden')
            updater.classList.remove('flex')
            autoUpdater.downloadNewVersion()

            autoUpdater.on("finished", () => {
                this.notification("O BRLauncher foi atualizado para a versão mais recente. Reabra o launcher para ver as novidades.")
            }) 

            autoUpdater.on('error', (error) => {
                console.log(error)
            })
        })
    }
}

export {
    HomePage
}