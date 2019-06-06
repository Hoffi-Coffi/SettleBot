import { singleton } from 'tsyringe';
import * as Discord from "discord.js";

import { StatsService } from '../services/statsService';
import { AdminService } from '../services/adminService';
import { MemberService } from '../services/memberService';
import { FilterService } from '../services/filterService';
import { CmlService } from '../services/cmlService';
import { ConfigService } from '../services/configService';

import { Logger } from '../utilities/logger';

const MOD = "commandHandler.ts";

@singleton()
export class CommandHandler {
    private commandDefinitions = [];

    constructor(private statsService: StatsService, private adminService: AdminService, private memberService: MemberService, private filterService: FilterService,
        private cmlService: CmlService, private configService: ConfigService, private logger: Logger) {}

    private registerCommand(trigger: string, action: Function, preReq?: (msg: Discord.Message) => boolean): void {
        var existingCommand = this.commandDefinitions.find((cmd) => cmd.trigger === trigger);

        if (existingCommand) {
            this.logger.error(`Attempted to register a command for trigger "${trigger}" but one already exists!`, MOD);
            return;
        }

        this.commandDefinitions.push({
            trigger: trigger,
            action: action,
            preReq: preReq
        });
    }

    startup(): void {
        this.statsService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));
        this.adminService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));
        this.memberService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));
        this.filterService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));
        this.cmlService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));
        this.configService.startup((trigger, action, preReq) => this.registerCommand(trigger, action, preReq));

        this.logger.info(`Command registration complete. Total commands: ${this.commandDefinitions.length}`, MOD);
    }

    setup(bot: Discord.Client): void {
        var server = bot.guilds.first();

        this.adminService.setup(() => {
            this.logger.info("Destroying bot...", MOD);
            bot.destroy().then(() => {
                process.exit();
            })
            .catch((err) => {
                this.logger.error(`Failed to destroy bot: ${err}`);
                process.exit(1);
            });
        }, 
        server.channels.find((channel) => channel.name === 'bot-log'),
        server.roles.find((role) => role.name === "Muted"));
        this.memberService.setup(server.roles.find((role) => role.name === 'Athlete'));
        this.configService.setup(server.channels.find((channel) => channel.name === "settlement_athletes"));
    }

    trigger(trigger: string, msg: Discord.Message, args: string[]): boolean {
        this.logger.info(`Attempting to find handler for command "${trigger}"...`, MOD);
        var foundCommand = this.commandDefinitions.find((cmd) => cmd.trigger === trigger);

        if (!foundCommand) {
            this.logger.info("Command not found.", MOD);
            return false;
        }

        this.logger.info("Command found! Executing...", MOD);

        var preReqPassed = (!foundCommand.preReq);
        if (!preReqPassed) preReqPassed = foundCommand.preReq(msg);

        if (preReqPassed) foundCommand.action(msg, args);

        return true;
    }
};