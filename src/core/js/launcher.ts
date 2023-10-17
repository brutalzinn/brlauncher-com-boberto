import { Launch } from "minecraft-java-core"
import LauncherSettings from "../../db/launcher.js"
import Account from "../../db/account.js"
import { LauncherOptions } from "../../interfaces/launcher.js"
import path from "path"

class Launcher extends Launch {
    constructor() {
        super()
        console.log("[CLIENT SIDE] CLASSE LAUNCHER CARREGADA")
    }
    async init(launcherOptions: LauncherOptions) {
        const accounts = await Account.accounts()
        if (!accounts.length) {
            alert("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.")
            this.emit('close')
            return
        }

        const settings = await LauncherSettings.config()
        if(!settings) return

        const auth = await Account.getAtual()
        const pathDir = launcherOptions.dirName != null ? path.join(settings.path, launcherOptions.dirName) : settings.path
        const config = {
            authenticator: this.convert(auth),
            timeout: 10000,
            path: pathDir,
            version: launcherOptions.version,
            detached: false,
            url: launcherOptions.url!,
            downloadFileMultiple: 10,
            loader: {
                type: launcherOptions.loader?.type,
                build: launcherOptions.loader?.build,
                enable: launcherOptions.loader?.enable
            },
            verify: launcherOptions.verify ?? false,
            ignored: ['loader', 'options.txt'],
            java: true,
            javaPath: settings.javaPath as string,
            screen: {
                width: settings.width,
                height: settings.height,
            },

            memory: {
                min: `${settings.min}M`,
                max: `${settings.max}M`
            },
            JVM_ARGS: [],
            GAME_ARGS: []
        }
        await this.Launch(config)

        console.log("[CLIENT SIDE] LAUCNHER ARGS", config)

    }

    convert(account_connect: any){
        return {
            access_token: account_connect.access_token,
            client_token: account_connect.client_token,
            uuid: account_connect.uuid,
            name: account_connect.name,
            user_properties: JSON.parse(account_connect.user_properties),
            meta: JSON.parse(account_connect.meta)
        }
    }

}

export {
    Launcher
}