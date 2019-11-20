import * as Discord from "discord.js";

export default class Guard {
    private static devMode: boolean = true;
    private static server: Discord.Guild;

    static isMod(msg: Discord.Message): boolean {
        if (msg.channel.type !== "text") return false;

        var memb = msg.guild.member(msg.author);

        return this.modPermCheck(memb);
    }

    static isModPriv(msg: Discord.Message): boolean {
        if (!this.server) return false;

        var memb = this.server.member(msg.author);

        return this.modPermCheck(memb);
    }

    static isBotChannelOrMod(msg: Discord.Message): boolean {
        if (msg.channel.type !== "text") return false;

        var chan: Discord.TextChannel = <Discord.TextChannel>msg.channel;

        if (!chan) return false;
        if (chan.name === 'bot-channel') return true;

        return this.modPermCheck(msg.guild.member(msg.author));
    }

    static hasRole(msg: Discord.Message, roleName: string): boolean {
        if (!this.server) return false;

        var memb = this.server.member(msg.author);

        if (!memb) return false;

        var findRole = memb.roles.find((role) => role.name.toLowerCase() === roleName.toLowerCase());

        if (findRole) return true;

        return false;
    }

    private static modPermCheck(memb: Discord.GuildMember): boolean {
        return (memb && memb.hasPermission(Discord.Permissions.FLAGS.KICK_MEMBERS));
    }

    static isSeniorMod(msg: Discord.Message): boolean {
        if (msg.channel.type !== "text") return false;

        var memb = msg.guild.member(msg.author);

        return this.seniorModPermCheck(memb);
    }

    static isSeniorModPriv(msg: Discord.Message): boolean {
        if (!this.server) return false;

        var memb = this.server.member(msg.author);

        return this.seniorModPermCheck(memb);
    }

    private static seniorModPermCheck(memb: Discord.GuildMember): boolean {
        return (memb && memb.hasPermission(Discord.Permissions.FLAGS.MANAGE_MESSAGES));
    }

    static isAdmin(msg: Discord.Message): boolean {
        if (msg.channel.type !== "text") return false;

        var memb = msg.guild.member(msg.author);

        return this.adminPermCheck(memb);
    }

    static isAdminPriv(msg: Discord.Message): boolean {
        if (!this.server) return false;

        var memb = this.server.member(msg.author);

        return this.adminPermCheck(memb);
    }

    private static adminPermCheck(memb: Discord.GuildMember): boolean {
        return (memb && memb.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR));
    }

    static isAdminChan(msg: Discord.Message): boolean {
        var chan: Discord.TextChannel = <Discord.TextChannel>msg.channel;

        if (!chan) return false;

        return chan.name === 'admin-chat';
    }

    static isSotwChan(msg: Discord.Message): boolean {
        var chan: Discord.TextChannel = <Discord.TextChannel>msg.channel;

        if (!chan) return false;

        return chan.name === 'sotw-bot';
    }

    static isDevMode(): boolean {
        return this.devMode;
    }

    static setDevMode(_devMode: boolean): void {
        this.devMode = _devMode;
    }

    static setServer(_server: Discord.Guild): void {
        this.server = _server;
    }
};