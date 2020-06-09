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

    startup(registerCallback: (trigger: string[], 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback(["help"], (msg) => this.help(msg), CommandType.All);
        registerCallback(["sotwinfo", "compinfo"], (msg) => this.compInfo(msg), CommandType.All);

        this.logger.info("Registered 2 commands.", MOD);
    }

    setup(_rulesChannel: Discord.GuildChannel, _sotwChannel: Discord.GuildChannel) {
        this.rulesChannel = <Discord.TextChannel>_rulesChannel;
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;
    }

    private compInfo(msg: Discord.Message): void {
        var response = "**====== Weekly Competitions! ======**\n";
        response += "Fancy a challenge? Want to prove your sweatiness once and for all? Our weekly competitions are for you!\n\n";

        response += "**== What _is_ the weekly competition? ==**\n";
        response += "Most of the time, the weekly competition is in the form of a Skill-Of-The-Week (SOTW) competition.";
        response += "SOTW is a challenge in which players compete to gain the most XP in a certain skill within 7 days.\n\n";
        response += "Once the competition has commenced, you will have exactly 7 days to gain more XP than anyone else in the competition using any means necessary! No methods (within game rules) are out of bounds.\n\n";

        response += "Every once in a while, a different style of competition will take place - instead of gaining XP, you'll be racking up as much KC of a specific boss as possible. Other than that, the rules remain the same.\n\n";

        response += "**== How does it work? ==**\n";
        response += "A few days before the current competition ends, a poll will be posted and pinned containing options for the next competition. The winner of this poll will be the skill competed on. SettleBot will announce the winning skill _up to_ 30 minutes before the next competition begins.\n\n";
        response += "During the competition, your gains will only be recorded once you logout of OSRS and update your record with me using the `&update` command. I will check the OSRS Hiscores roughly every 6 hours on top of this.\n";
        response += "**Important:** At the end of the competition, _you_ are responsible for making sure all of your gains are recorded _before_ the time is up! I won't count any updates done _after_ the competition has ended, so we recommend a 2-5 minute buffer before the competition ends.\n\n";
        response += "After the 7 days are up, a winner will emerge and reap the spoils of their labour. What are the spoils, you ask? Well...";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);

        response = "**== REWARDS ==**\n";
        response += "If you are victorious in a SOTW challenge, you will receive the coveted `SOTW Champ` role. This role will distinguish you as one of the best Runescapers in the Grotto. This role will remain with you forever.\n\n";

        response += "You will _also_ receive another role detailing your expertise in the skill(s) you won competitions for. You can have as many of these roles as you like (provided you win the respective competition), however **BEWARE** - once your skill comes back into the competition, you must fight to keep your expert title, otherwise you may lose it!\n\n";

        response += "Finally, there's usually a cash and/or bond prize for the winner - check the pinned messages for more information!\n\n";

        response += "**== How do I use SettleBot? ==**\n";
        response += "Firstly, make sure SettleBot knows who you are by using the command `&register <rsn>` - this command will also allow you to do the `&stats` and `&kc` commands without supplying your RSN.\n\n";

        response += "Then, once you're ready to join a competition, simply use the `&join` command! If a competition is currently running, you'll be automatically placed into that competition. Otherwise, you'll be on the waiting list for a new competition.\n\n";

        response += "**IMPORTANT:** You must do `&join` for every competition you wish to enter - your entry won't be carried over from one competition to the next! This is to prevent the competition roster from being bloated with people not competing. You don't need to register your RSN with the bot again, however.\n\n";
        response += "During a competition, you can use the `&comp` command to see the top-5 leaderboard. Don't worry if you're not in the top-5! SettleBot will also show you where you currently stand on the leaderboard.";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);
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

        response += `If this interests you, head on over to ${sotw} and read the pinned messages, or reply to me with the \`&compinfo\` command to find out more.\n`;

        response += "I can also look up people's stats from the Runescape hiscores! You can use the command `&stats <rsn>` and I'll tell you that user's stats. If you've registered your ";
        response += "RSN with me, you can also just run `&stats` and I'll post your stats. I can also show you your kill count of most bosses with the `&kc <boss>` command!\n\n";

        response += "I do a few other things, but they're mostly in the background to support the server staff. However, I'm improving all the time, so watch this space!";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);
    }
}