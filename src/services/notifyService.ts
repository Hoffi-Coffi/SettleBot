import Discord from "discord.js";
import { singleton } from "tsyringe";
import { Logger } from "../utilities/logger";
import { CommandType } from "../utilities/models";
import ServerUtils from "../utilities/serverUtils";
import Guard from "../utilities/guard";

const MOD = "notifyService.ts";

@singleton()
export class NotifyService {
    private notifyEventsRole: Discord.Role;
    private eventsChannel: Discord.TextChannel;
    private eventInfoChannel: Discord.TextChannel;
    private reactMessage: Discord.Message;

    constructor(private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("notifyevents", (msg, args) => this.broadcastNotification(msg, args), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        
        this.logger.info("Registered 1 command.", MOD);
    }

    setup(_notifyEventsRole: Discord.Role, _eventsChannel: Discord.GuildChannel, _eventInfoChannel: Discord.GuildChannel) {
        this.notifyEventsRole = _notifyEventsRole;
        this.eventsChannel = <Discord.TextChannel>_eventsChannel;
        this.eventInfoChannel = <Discord.TextChannel>_eventInfoChannel;

        if (!this.notifyEventsRole) this.logger.warn("Couldn't find a notify events role.", MOD);
        if (!this.eventsChannel) this.logger.warn("Couldn't find an events channel.", MOD);
        if (!this.eventInfoChannel) this.logger.warn("Couldn't find an event info channel.", MOD);
        else {
            this.eventInfoChannel.fetchMessages({
                limit: 1
            }).then((msgs) => {
                var msgsArr = msgs.array();
                this.reactMessage = msgsArr[0];
            });
        }
    }

    handleReactAdd(msgReact: Discord.MessageReaction, user: Discord.User): boolean {
        if (msgReact.message !== this.reactMessage) return false;
        if (msgReact.emoji.name !== '🔔') return false;

        ServerUtils.addRoleToUser(msgReact.message.guild.member(user), this.notifyEventsRole);
        return true;
    }

    handleReactRemove(msgReact: Discord.MessageReaction, user: Discord.User): boolean {
        if (msgReact.message !== this.reactMessage) return false;
        if (msgReact.emoji.name !== '🔔') return false;

        ServerUtils.removeRole(msgReact.message.guild.member(user), this.notifyEventsRole, "Requested by user.");
        return true;
    }

    private broadcastNotification(msg: Discord.Message, args: string[]): void {
        this.notifyEventsRole.setMentionable(true).then((role) => {
            this.eventsChannel.send(`${role}: ${args.join(' ')}`).then(() => {
                this.notifyEventsRole.setMentionable(false);
            });
        });
    }
}