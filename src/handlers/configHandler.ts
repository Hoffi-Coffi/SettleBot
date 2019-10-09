import { singleton } from "tsyringe";
import * as fs from "fs";

import { Logger } from "../utilities/logger";

const MOD = "configHandler.ts";

@singleton()
export class ConfigHandler {
    private configLoaded: boolean = false;
    private configItems = undefined;

    constructor(private logger: Logger) {
        this.loadConfig();
    }

    private loadConfig(forceReload: boolean = false, callback: Function = undefined): void {
        if (!forceReload && this.configLoaded) return;

        fs.readFile("./config.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read config: ${err}`, MOD);
                return;
            }

            this.configItems = JSON.parse(data.toString()).config;
            this.configLoaded = true;
            this.logger.info("Config loaded", MOD);

            if (callback) callback();
        });
    }

    getSetting(name: string): string {
        if (!this.configLoaded) return null;

        name = name.toLowerCase();

        var setting = this.configItems.find((obj) => {
            return obj.startsWith(name);
        });

        return (setting) ? setting.replace(`${name}:`, "") : null;
    }

    updateMultipleSettings(settings, callback?: Function): void {
        fs.readFile("./config.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read config: ${err}`, MOD);
                return;
            }
    
            var model = JSON.parse(data.toString());
    
            settings.forEach((setting) => {
                var name = setting.name.toLowerCase();
                var value = setting.value;
    
                var setting = this.configItems.find((obj) => {
                    return obj.startsWith(name);
                });
        
                if (!setting) {
                    model.config.push(`${name}:${value}`);
                    return;
                }
        
                var idx = model.config.indexOf(setting);
                if (idx > -1) {
                    model.config.splice(idx, 1);
        
                    model.config.push(`${name}:${value}`);
                }
            });
    
            fs.writeFile("./config.json", JSON.stringify(model), (err) => {
                if (err) this.logger.error(`Failed to update config: ${err}`, MOD);
                else this.loadConfig(true, callback);
            });
        });
    }

    updateSetting(name: string, value: string, callback?: Function) {
        this.updateMultipleSettings([{
            name: name,
            value: value
        }], callback);
    }
};