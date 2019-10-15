import { injectable } from "tsyringe";
import Discord from "discord.js";

import { Logger } from "../utilities/logger";
import ServerUtils from "../utilities/serverUtils";
import { CommandType } from "../utilities/models";

const MOD = "helpService.ts";

@injectable()
export class HelpService {
    private rulesChannel: Discord.TextChannel;
    private sotwChannel: Discord.TextChannel;

    constructor(private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("help", (msg) => this.help(msg), CommandType.All);

        this.logger.info("Registered 1 command.", MOD);
    }

    setup(_rulesChannel: Discord.GuildChannel, _sotwChannel: Discord.GuildChannel) {
        this.rulesChannel = <Discord.TextChannel>_rulesChannel;
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;
    }

    private help(msg?: Discord.Message): void {
        var memb = (msg && msg.guild) ? msg.guild.member(msg.author) : "there";
        var response = `Hi ${memb}! I'm SettleBot.\n\n`;
        response += "At the moment, I'm responsible for making sure the Grotto Discord server stays wholesome. ";
        
        var rules = (this.rulesChannel) ? `${this.rulesChannel}` : "rules";
        response += `I sometimes delete messages that go against our rules (see the ${rules} channel for more info), `;
        response += "and in rare cases I can mute people. Stick to the rules, however, and this won't happen to you.\n\n";

        var sotw = (this.sotwChannel) ? `${this.sotwChannel}` : "#sotw-bot";
        response += `If you're interested in a little competition, check out the ${sotw} channel. `;
        response += "In there, we run regular \"Skill of the Week\" competitions, where we challenge everyone to gain the most xp ";
        response += "in a given skill within a week! If you win a competition, you'll be awarded a (permanent) \"SOTW Champ\" role ";
        response += "as well as a specific skill expert role, which you will keep so long as you remain the champion of that skill!\n\n";

        response += `If this interests you, head on over to ${sotw} and read the pinned messages, or reply to me with the \`&sotwinfo\` command to find out more.\n`;

        response += "I can also look up people's stats from the Runescape hiscores! You can use the command `&stats <rsn>` and I'll tell you that user's stats. If you've registered your ";
        response += "RSN with me, you can also just run `&stats` and I'll post your stats. Please use this command responsibly.\n\n";

        response += "I do a few other things, but they're mostly in the background to support the server staff. However, I'm improving all the time, so watch this space!";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);
    }
}