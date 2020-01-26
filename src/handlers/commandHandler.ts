import { singleton } from 'tsyringe';
import * as Discord from "discord.js";

import { MetricService } from '../services/metricService';
import { AdminService } from '../services/adminService';
import { MemberService } from '../services/memberService';
import { FilterService } from '../services/filterService';
import { ConfigService } from '../services/configService';

import { Logger } from '../utilities/logger';
import { HelpService } from '../services/helpService';
import { StatsService } from '../services/statsService';
import { EventsService } from '../services/eventsService';
import { LuckyService } from '../services/luckyService';
import { SotwAdminService } from '../services/sotwAdminService';
import { CommandType } from '../utilities/models';
import { LeaderboardService } from '../services/leaderboardService';
import { NotifyService } from '../services/notifyService';
import ServerUtils from '../utilities/serverUtils';
import { PollService } from '../services/pollService';
import { PollHandler } from './pollHandler';

const MOD = "commandHandler.ts";

interface ICommandDefinition {
    trigger: string[],
    action: (msg?: Discord.Message, args?: string[]) => string | void,
    preReq?: (msg: Discord.Message) => boolean
    type: CommandType
};

@singleton()
export class CommandHandler {
    private commandDefinitions: ICommandDefinition[] = [];

    constructor(private metricService: MetricService, 
        private adminService: AdminService, 
        private memberService: MemberService, 
        private filterService: FilterService,
        private configService: ConfigService, 
        private helpService: HelpService,
        private statsService: StatsService,
        private eventsService: EventsService,
        private luckyService: LuckyService,
        private sotwAdminService: SotwAdminService,
        private leaderboardService: LeaderboardService,
        private notifyService: NotifyService,
        private pollService: PollService,
        private pollHandler: PollHandler,
        private logger: Logger) {}

    private registerCommand(
        trigger: string[], 
        action: (msg?: Discord.Message, args?: string[]) => string | void, 
        commandType: CommandType,
        preReq?: (msg: Discord.Message) => boolean): void {
        var existingCommand = this.commandDefinitions.find((cmd) => cmd.trigger === trigger);

        if (existingCommand) {
            this.logger.error(`Attempted to register a command for trigger "${trigger}" but one already exists!`, MOD);
            return;
        }

        this.commandDefinitions.push({
            trigger: trigger,
            action: action,
            preReq: preReq,
            type: commandType
        });
    }

    startup(): void {
        this.metricService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.adminService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.memberService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.filterService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.configService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.helpService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.statsService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.eventsService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.luckyService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.sotwAdminService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.leaderboardService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.notifyService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));
        this.pollService.startup((trigger, action, commandType, preReq) => 
            this.registerCommand(trigger, action, commandType, preReq));

        this.logger.info(`Command registration complete. Total commands: ${this.commandDefinitions.length}`, MOD);
    }

    setup(bot: Discord.Client): void {
        var server = ServerUtils.getServer();

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

        var sotwChannel = server.channels.find((chan) => chan.name === "sotw-bot");
        this.memberService.setup(server.roles.find((role) => role.name === 'SOTW Competitor'));
        this.sotwAdminService.setup(server.roles.find((role) => role.name === 'SOTW Competitor'), server.roles.find((role) => role.name === "SOTW Champ"), sotwChannel, server);
        this.helpService.setup(server.channels.find((chan) => chan.name === "rules-and-info"), sotwChannel);
        this.notifyService.setup(server.roles.find((role) => role.name === "Event Notifications"), server.channels.find((chan) => chan.name === "general-minigame"), server.channels.find((chan) => chan.name === "minigame-info"));
        
        var poll = this.pollHandler.getPoll();

        if (poll) {
            var sotwTextChannel = <Discord.TextChannel>sotwChannel;
            sotwTextChannel.fetchMessage(poll.pollMsgId).then((msg) => {
                this.pollService.setup(msg, sotwChannel);
            });
        } else {
            this.pollService.setup(null, sotwChannel);
        }
    }

    trigger(trigger: string, msg: Discord.Message, args: string[], commandType: CommandType): boolean {
        var cmdType = "Generic";
        if (commandType === CommandType.Private) cmdType = "Private";
        else if (commandType === CommandType.Public) cmdType = "Public";
        
        this.logger.info(`Attempting to find handler for ${cmdType} command "${trigger}"...`, MOD);
        var foundCommand = this.commandDefinitions.find((cmd) => cmd.trigger.indexOf(trigger) > -1 && (cmd.type === CommandType.All || cmd.type === commandType));

        if (!foundCommand) {
            this.logger.info("Command not found.", MOD);
            return false;
        }

        this.logger.info("Command found! Executing...", MOD);

        var preReqPassed = (!foundCommand.preReq);
        if (!preReqPassed) preReqPassed = foundCommand.preReq(msg);

        this.logger.info(`Pre-req passed? ${(preReqPassed) ? "Yes" : "No"}`, MOD);

        if (preReqPassed) {
            var result = foundCommand.action(msg, args);

            if (result) msg.reply(result);
        }

        return true;
    }
};