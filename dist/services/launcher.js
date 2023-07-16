"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const original_fs_1 = require("original-fs");
const minecraft_java_core_1 = require("minecraft-java-core");
const launcher = new minecraft_java_core_1.Launch();
window.addEventListener('DOMContentLoaded', () => {
    // const logs = document.getElementById("logs") as HTMLElement
    const playButton = document.getElementById("play");
    const minimize = document.getElementById("minimize");
    const barra = document.getElementById('barra');
    const discord = document.getElementById('discord');
    const startlauncher = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        playButton.disabled = true;
        playButton.innerHTML = '<span class="material-icons mr-1">access_time</span> Carregando...';
        const name = document.getElementById("name").value || "Player";
        const version = document.getElementById("version").value;
        (0, original_fs_1.writeFileSync)("./launcherCache.json", JSON.stringify({
            lastUsername: name,
            lastVersion: version
        }));
        const custom = (value) => {
            const values = {
                vanilla: {
                    bool: false,
                    type: undefined
                },
                fabric: {
                    bool: true,
                    type: 'fabric'
                },
                forge: {
                    bool: true,
                    type: 'forge'
                }
            };
            return values[value];
        };
        // const password = (document.getElementById("password") as HTMLInputElement).value
        yield launcher.Launch({
            authenticator: yield minecraft_java_core_1.Mojang.login(name),
            timeout: 10000,
            path: './.minecraft',
            version: version.split(" ")[0],
            detached: false,
            downloadFileMultiple: 100,
            loader: {
                type: (_a = custom(version.split(" ")[1])) === null || _a === void 0 ? void 0 : _a.type,
                build: "latest",
                enable: (_b = custom(version.split(" ")[1])) === null || _b === void 0 ? void 0 : _b.bool
            },
            verify: false,
            ignored: ['loader', 'options.txt'],
            args: [],
            javaPath: null,
            java: true,
            screen: {
                width: 1000,
                height: 650,
                fullscreen: null,
            },
            memory: {
                min: '1G',
                max: '3G'
            }
        });
        launcher.on("progress", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on("check", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1000000).toPrecision(2)}/${(size / 1000000).toPrecision(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on('estimated', (time) => {
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time - hours * 3600) / 60);
            let seconds = Math.floor(time - hours * 3600 - minutes * 60);
            console.log(`${hours}h ${minutes}m ${seconds}s`);
        });
        launcher.on('close', (code) => {
            playButton.disabled = false;
            playButton.innerHTML = '<span class="material-icons mr-1">play_circle</span> Jogar';
            electron_1.ipcRenderer.invoke("stopPlaying");
        });
        launcher.on("error", (err) => {
            playButton.disabled = false;
            playButton.innerHTML = '<span class="material-icons mr-1">play_circle</span> Jogar';
            electron_1.ipcRenderer.invoke("stopPlaying");
            alert(JSON.stringify(err));
        });
        launcher.on('data', (data) => {
            if (data.includes("Launching"))
                electron_1.ipcRenderer.invoke("playing", version);
        });
        // launcher.on('debug', console.log)
    });
    minimize.addEventListener("click", () => electron_1.ipcRenderer.invoke("minimize"));
    playButton.addEventListener("click", startlauncher);
});