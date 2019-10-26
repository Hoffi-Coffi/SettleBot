import {Logger} from './logger';
import Discord from 'discord.js';

const MOD: string = "serverUtils.ts";

export default class ServerUtils {
    private static server: Discord.Guild;
    private static logger: Logger = new Logger();

    static getDiscordMemberById(discordId: string): Discord.GuildMember {
        if (!this.server) return;

        return this.server.member(discordId);
    }

    static addRoleToUser(memb: Discord.GuildMember, role: Discord.Role): void {
        if (!memb) return;

        memb.addRole(role)
            .catch(err => {
                this.logger.error(`Failed to add ${role.name} role to ${memb}. Error: ${err}`, MOD);
            });
    }

    static setUserRoles(memb: Discord.GuildMember, roles: Discord.Role[], reason: string): Promise<Discord.GuildMember> {
        return memb.setRoles(roles, reason);
    }

    static removeRole(memb: Discord.GuildMember, role: Discord.Role, reason: string): void {
        memb.removeRole(role, reason);
    }

    static emptyRole(role: Discord.Role): void {
        role.members.forEach(memb => {
            this.removeRole(memb, role, "Emptying the role.");
        });
    }

    static messageChannel(channel: Discord.TextChannel, message: string) {
        channel.send(message)
            .catch(err => {
                this.logger.warn(`Couldn't send message to ${channel.name}. Error: ${err}`, MOD);
            });
    }

    static directMessage(memb: Discord.GuildMember, message: string) {
        memb.createDM()
            .then(chan => {
                chan.send(`${message}\n\nI am a bot, and this action was performed automatically. DM replies are not monitored.`);
            })
            .catch(err => {
                this.logger.warn(`Couldn't DM ${memb}. Error: ${err}`, MOD);
            });
    }

    static deleteMessage(msg: Discord.Message, callback: Function) {
        msg.delete()
            .then(() => {
                if (callback) callback();
            })
            .catch((err) => {
                this.logger.warn(`Failed to delete message. Error: ${err}`, MOD);
            });
    }

    static setServer(_server: Discord.Guild): void {
        this.server = _server;
    }
};