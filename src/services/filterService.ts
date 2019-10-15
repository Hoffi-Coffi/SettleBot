import { injectable } from 'tsyringe';
import Discord from "discord.js";

import { FilterHandler } from '../handlers/filterHandler';
import { MetricHandler } from '../handlers/metricHandler';
import { OffenderHandler } from '../handlers/offenderHandler';

import { AdminService } from './adminService';

import { Logger } from '../utilities/logger';
import ServerUtils from "../utilities/serverUtils";
import Guard from "../utilities/guard";
import { CommandType, Metric } from '../utilities/models';

const MOD = "filterService.ts";

@injectable()
export class FilterService {
    constructor(private filterHandler: FilterHandler, private metricHandler: MetricHandler, 
        private offenderHandler: OffenderHandler, private adminService: AdminService, private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("addword", (msg, args) => this.addWord(msg, args), CommandType.Private, (msg) => Guard.isSeniorModPriv(msg));
        registerCallback("rmword", (msg, args) => this.removeWord(msg, args), CommandType.Private, (msg) => Guard.isSeniorModPriv(msg));

        this.logger.info("Registered 2 commands.", MOD);
    }

    scan(msg: Discord.Message): void {
        this.metricHandler.increment(Metric.MessagesSeen);
        var words = JSON.stringify(msg.content).split(' ');

        words.some(word => {
            this.metricHandler.increment(Metric.WordsScanned);
            var result = this.filterHandler.checkword(word);

            if (!result) return false;

            var memb = msg.guild.member(msg.author);

            switch (result) {
                case "delete":
                    this.metricHandler.increment(Metric.BadWordsFound);

                    ServerUtils.deleteMessage(msg, () => {
                        this.metricHandler.increment(Metric.DeletedMessages);
                        this.offenderHandler.add(msg.author.username);

                        var result = this.offenderHandler.check(msg.author.username);

                        if (result === "warn") {
                            ServerUtils.directMessage(memb, `Hi ${memb}. You've had three messages deleted by me recently, for bad language. This message is just to let you know that the next time I need to delete your message, you'll also be muted.`);
                        } else if (result === "mute") {
                            ServerUtils.setUserRoles(memb, [this.adminService.getMuteRole()], "Member reached 4 infractions.")
                                .then(() => {
                                    this.metricHandler.increment(Metric.MembersMutedAuto);
                                    ServerUtils.messageChannel(this.adminService.getAuditChannel(), `${memb} was muted because they reached 4 infractions.`);
                                    ServerUtils.directMessage(memb, `Hi ${memb}, you were muted in the Settlement Discord server for bad language. To be unmuted, please DM a Mod or Admin.`);
                                })
                                .catch((err) => {
                                    this.logger.warn(`Tried to mute ${memb} but couldn't. Reason: ${err}`, MOD);
                                });
                        }
                    });
                    return true;
                case "mute":
                    this.metricHandler.increment(Metric.BadWordsFound);

                    ServerUtils.deleteMessage(msg, () => {
                        this.metricHandler.increment(Metric.DeletedMessages);
                        this.offenderHandler.add(msg.author.username);

                        ServerUtils.setUserRoles(memb, [this.adminService.getMuteRole()], "Member triggered the mutelist.")
                            .then(() => {
                                this.metricHandler.increment(Metric.MembersMutedAuto);
                                ServerUtils.messageChannel(this.adminService.getAuditChannel(), `${memb} was muted because they triggered the mutelist.`);
                                ServerUtils.directMessage(memb, `Hi ${memb}, you were muted in the Settlement Discord server for bad language. To be unmuted, please DM a Mod or Admin.`);
                            })
                            .catch((err) => {
                                this.logger.warn(`Tried to mute ${memb} but couldn't. Reason: ${err}`, MOD);
                            });
                    });
                    return true;
            }

            return false;
        });
    }

    private addWord(msg: Discord.Message, args: string[]): void {
        if (args.length < 2) {
            msg.reply("you must provide an action and a word. Usage: `&addword <action> <word>`. Current actions are `delete` or `mute`.");
            return;
        }
    
        var action = args[0];
        var word = args[1];
    
        this.filterHandler.addword(action, word);
        msg.reply("added!");
    }

    private removeWord(msg: Discord.Message, args: string[]): void {
        if (args.length < 2) {
            msg.reply("you must provide an action and a word. Usage: `&rmword <action> <word>`. Current actions are `delete` or `mute`.");
            return;
        }
    
        var action = args[0];
        var word = args[1];
    
        this.filterHandler.rmword(action, word);
        msg.reply("removed!");
    }
};