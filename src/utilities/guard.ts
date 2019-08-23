import * as Discord from "discord.js";

export default class Guard {
    private static devMode: boolean = true;
    private static server: Discord.Guild;

    static isMod(msg: Discord.Message): boolean {
        var memb = msg.guild.member(msg.author);

        return this.modPermCheck(memb);
    }

    static isModPriv(msg: Discord.Message): boolean {
        if (!this.server) return false;

        var memb = this.server.member(msg.author);

        return this.modPermCheck(memb);
    }

    private static modPermCheck(memb: Discord.GuildMember): boolean {
        return (memb && memb.hasPermission(Discord.Permissions.FLAGS.KICK_MEMBERS));
    }

    static isSeniorMod(msg: Discord.Message): boolean {
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

    static isBotOwner(msg: Discord.Message): boolean {
        return (msg.author.username === "Hoffi Coffi" && msg.author.tag === "Hoffi Coffi#2536");
    }

    static isToucann(msg: Discord.Message): boolean {
        return (msg.author.username === "Toucann" && msg.author.tag === "Toucann#6889");
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