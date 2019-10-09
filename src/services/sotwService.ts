import Discord from "discord.js";
import moment from "moment";

import { injectable, singleton } from "tsyringe";
import { Logger } from "../utilities/logger";
import { CommandType } from "../handlers/commandHandler";
import { MemberHandler } from "../handlers/memberHandler";
import Guard from "../utilities/guard";
import { ConfigHandler } from "../handlers/configHandler";
import { CmlHandler } from "../handlers/cmlHandler";
import ServerUtils from "../utilities/serverUtils";
import { SotwHandler } from "../handlers/sotwHandler";

const MOD = "sotwService.ts";

const skillTopicMap = [
    {skill: "Attack", topic: "hit thing :crossed_swords:"}, {skill: "Strength", topic: "STRONK :muscle:"}, {skill: "Defence", topic: "not be hit :shield:"},
    {skill: "Ranged", topic: "yeeting :bow_and_arrow:"}, {skill: "Prayer", topic: "bothering deities :pray:"}, {skill: "Magic", topic: "splashing"},
    {skill: "Runecrafting", topic: "make magic rocks"}, {skill: "Hitpoints", topic: "livin' :heart:"}, {skill: "Crafting", topic: "make thing :tools:"},
    {skill: "Mining", topic: "hit rock :pick:"}, {skill: "Smithing", topic: "armour make :hammer:"}, {skill: "Fishing", topic: "obtain swimmers :fish:"},
    {skill: "Cooking", topic: "food"}, {skill: "Firemaking", topic: "burn stuff"}, {skill: "Woodcutting", topic: "chop wood :deciduous_tree: :evergreen_tree:"},
    {skill: "Agility", topic: "gotta go fast"}, {skill: "Herblore", topic: "uim's worst nightmare"}, {skill: "Thieving", topic: "illegal activities"},
    {skill: "Fletching", topic: "make stuff to yeet"}, {skill: "Slayer", topic: "kill specific stuff"}, {skill: "Farming", topic: "grow stuff"},
    {skill: "Construction", topic: "build stuff"}, {skill: "Hunter", topic: "catch animal"}
];

@singleton()
export class SotwService {
    private competitorRole: Discord.Role;
    private sotwChannel: Discord.TextChannel;
    private server: Discord.Guild;

    constructor(private memberHandler: MemberHandler, 
        private configHandler: ConfigHandler,
        private cmlHandler: CmlHandler,
        private sotwHandler: SotwHandler,
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("joincomp", (msg) => this.joinComp(msg), CommandType.Public, (msg) => Guard.isSotwChan(msg));
        registerCallback("sotwinfo", (msg) => this.sendInfo(msg), CommandType.All);

        this.logger.info("Registered 2 commands.", MOD);
    }

    setup(_competitorRole: Discord.Role, _sotwChannel: Discord.GuildChannel, _server: Discord.Guild): void {
        this.competitorRole = _competitorRole;
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;
        this.server = _server;

        this.updateTopic();
        this.setupTimeouts();

        if (!this.competitorRole) this.logger.warn("Couldn't find a competitor role.", MOD);
        if (!this.sotwChannel) this.logger.warn("Couldn't find a SOTW channel", MOD);
    }

    private joinComp(msg: Discord.Message): void {
        var getRSN = this.memberHandler.get(msg.author.username);

        if (!getRSN) {
            msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>` first.");
            return;
        }

        var sotwEnd = moment(this.configHandler.getSetting("sotwEnd"));

        if (sotwEnd.isAfter(moment())) {
            // Comp is currently running.
            var reply: Discord.Message = null;

            var finalise = (exists: boolean) => {
                this.cmlHandler.updatePlayer(getRSN.rsn, () => {
                    ServerUtils.addRoleToUser(msg.guild.member(msg.author), this.competitorRole);
                    reply.delete();
                    if (!exists) msg.reply("I've added you to the current competition.");
                    else msg.reply("you're already in the current competition!");
                });
            }

            msg.reply("give me a moment whilst I add you to the current competition...")
                .then((_reply) => {
                    reply = <Discord.Message>_reply;
                    this.cmlHandler.getGroup((group: string) => {
                        this.cmlHandler.getUserList(group, (playerList: string) => {
                            if (!playerList) finalise(true);
                            else if (playerList.toLowerCase().indexOf(getRSN.rsn.toLowerCase()) > -1) finalise(true);
                            else this.cmlHandler.addPlayer(getRSN.rsn.toLowerCase(), group, () => finalise(false));
                        });
                    });
                });
        } else {
            // No comp is currently running.
            var added = this.sotwHandler.addCompetitor(getRSN);

            if (added) msg.reply("I've added you to the list. I'll let you know when the next competition starts.");
            else msg.reply("you're already on the list for the next competition. I'll let you know when it starts.");
        }
    }

    updateSotw(startDatetime: string, sotwCompId: string): void {
        this.sotwHandler.getCompetitors().forEach(comp => {
            var memb = this.server.member(comp.id);

            if (memb) ServerUtils.addRoleToUser(memb, this.competitorRole);
        });

        var startMillis = moment(startDatetime).valueOf();
        var nowMillis = moment().valueOf();

        var diff = (startMillis - nowMillis) + 30000;

        setTimeout(() => {
            this.configHandler.updateSetting("sotwCompId", sotwCompId, () => {
                this.cmlHandler.scrape(() => {
                    this.updateTopic();
                    this.setupTimeouts();

                    this.competitorRole.setMentionable(true).then(() => {
                        this.sotwChannel.send(`${this.competitorRole}, a new Skill Of The Week competition has begun!`)
                            .then(() => {
                                this.cmlHandler.sotw((res: string) => {
                                    this.sotwChannel.send(res);
                                }, 5);
                                this.competitorRole.setMentionable(false);
                            });
                    });
                }, sotwCompId);
            });
        }, diff);
    }

    private updateTopic() {
        var skill = this.configHandler.getSetting("sotwskill");

        var mappedTopic = skillTopicMap.find((obj) => obj.skill === skill[0].toUpperCase() + skill.substring(1)).topic;

        if (!mappedTopic) mappedTopic = skill;

        var topic = `this week we are training ${mappedTopic}`;

        if (this.sotwChannel.topic !== topic) this.sotwChannel.setTopic(`this week we are training ${mappedTopic}`);
    }

    private setupTimeouts() {
        var endMillis = moment(this.configHandler.getSetting("sotwend")).valueOf();
        var nowMillis = moment().valueOf();
        var diff = endMillis - nowMillis;

        if (diff < 0) return;

        var warnTime = (diff - (60000 * 30));

        if (warnTime > 0) {
            this.logger.info(`Setting a warning timeout for ${Math.ceil((warnTime / 1000) / 60)} minutes from now...`, MOD);
            setTimeout(() => {
                this.competitorRole.setMentionable(true).then(() => {
                    this.sotwChannel.send(`${this.competitorRole}, the competition ends in 30 minutes! Remember to logout of OSRS and use the \`&update\` command at least 2 minutes before the competition ends.`)
                        .then(() => {
                            this.competitorRole.setMentionable(false);
                        });
                });
            }, (diff - (60000 * 30)));
        }

        this.logger.info(`Setting an ending timeout for ${Math.ceil(((diff + 30000) / 1000) / 60)} minutes from now...`, MOD);
        setTimeout(() => {
            this.competitorRole.setMentionable(true).then(() => {
                this.sotwChannel.send(`${this.competitorRole}, the competition has ended! Let's take a look at the final results...`)
                    .then(() => {
                        this.cmlHandler.sotw((res: string) => {
                            this.sotwChannel.send(res);
                        }, 5);
                        this.competitorRole.setMentionable(false);
                        ServerUtils.emptyRole(this.competitorRole);
                    });
            });
        }, (diff + 30000));
    }

    private sendInfo(msg: Discord.Message): void {
        var response = "**====== Skill-of-the-Week (SOTW) ======**\n";
        response += "Fancy a challenge? Want to prove your sweatiness once and for all? SOTW is for you!\n\n";

        response += "**== What _is_ SOTW? ==**\n";
        response += "SOTW is a weekly challenge in which players compete to gain the most XP in a certain skill within 7 days.\n\n";
        response += "Once the competition has commenced, you will have exactly 7 days to gain more XP than anyone else in the competition using any means necessary! No methods are out of bounds.\n\n";

        response += "**== How does it work? ==**\n";
        response += "A few days before the current competition ends, a Strawpoll will be posted containing options for the next competition. The winner of this poll will be the skill competed on. SettleBot will announce the winning skill _up to_ 30 minutes before the next competition begins.\n\n";
        response += "Once the competition's started, make sure your CML records have been updated and show on the leaderboard. You can do this with a simple `&update` command, or through the CML website directly. SettleBot will provide a link to the competition page once it's begun.\n\n";
        response += "During the competition, your gains will only be recorded once you logout of OSRS and update your record with CML using the method(s) above.\n";
        response += "**Important:** At the end of the competition, _you_ are responsible for making sure all of your gains are recorded _before_ the time is up! CML won't count any updates done _after_ the competition has ended, so we recommend a 2-5 minute buffer before the competition ends.\n\n";
        response += "After the 7 days are up, a winner will emerge and reap the spoils of their labour. What are the spoils, you ask? Well...";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);

        response = "**== REWARDS ==**\n";
        response += "If you are victorious in a SOTW challenge, you will receive the coveted `SOTW Champ` role. This role will distinguish you as one of the best Runescapers in the Grotto. This role will remain with you forever.\n\n";

        response += "You will _also_ receive another role detailing your expertise in the skill(s) you won competitions for. You can have as many of these roles as you like (provided you win the respective competition), however **BEWARE** - once your skill comes back into the competition, you must fight to keep your expert title, otherwise you may lose it!\n\n";

        response += "**== How do I use SettleBot? ==**\n";
        response += "Firstly, make sure SettleBot knows who you are by using the command `&register <rsn>` - this command will also allow you to do the `&stats` command without supplying your RSN.\n\n";

        response += "Then, once you're ready to join a competition, simply use the `&joincomp` command! If a competition is currently running, you'll be automatically placed into that competition. Otherwise, you'll be on the waiting list for a new competition.\n\n";

        response += "**IMPORTANT:** You must do `&joincomp` for every competition you wish to enter - your entry won't be carried over from one competition to the next! This is to prevent the competition roster from being bloated with people not competing. You don't need to register your RSN with the bot again, however.\n\n";
        response += "During a competition, you can use the `&sotw` command to see the top-5 leaderboard. Don't worry if you're not in the top-5! SettleBot will also show you where you currently stand on the leaderboard.";

        if (msg.channel.type === 'dm') msg.reply(response);
        else ServerUtils.directMessage(msg.guild.member(msg.author), response);
    }
}