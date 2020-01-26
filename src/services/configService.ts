import { singleton } from "tsyringe";
import * as Discord from "discord.js";

import { ConfigHandler } from "../handlers/configHandler";

import { Logger } from "../utilities/logger";
import Guard from "../utilities/guard";
import { CommandType } from "../utilities/models";

const MOD = "configService.ts";

@singleton()
export class ConfigService {
    constructor(private configHandler: ConfigHandler, 
        private logger: Logger) {}

    startup(registerCallback: (trigger: string[], 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback(["setconfig"], (msg, args) => this.setConfig(msg, args), CommandType.Private, (msg) => Guard.isSeniorModPriv(msg));

        this.logger.info("Registered 1 command.", MOD);
    }

    private setConfig(msg: Discord.Message, args: string[]): void {
        if (args.length < 2) {
            msg.reply("you must provide a config name and value. Usage: `&setconfig <name> <value>`");
            return;
        }
    
        var callback = undefined;
    
        this.configHandler.updateSetting(args[0], args[1], callback);
    
        msg.reply("updated!");
    }
};