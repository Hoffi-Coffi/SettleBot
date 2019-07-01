import { singleton } from "tsyringe";

import { CmlHandler } from "../handlers/cmlHandler";
import { MemberHandler } from "../handlers/memberHandler";

import { ConfigService } from "./configService";

import { Logger } from "../utilities/logger";
import Guard from "../utilities/guard";
import Formatter from "../utilities/formatter";

import moment from "moment";
import Discord from "discord.js";
import { CommandType } from "../handlers/commandHandler";

const MOD = "cmlService.ts";

const skillMap = [
    {skill: "attack", match: ["att", "atk", "attack"]}, {skill: "strength", match: ["str", "strength", "stren"]}, {skill: "defence", match: ["def", "defence", "defense"]},
    {skill: "ranged", match: ["range", "ranged", "ranging"]}, {skill: "prayer", match: ["pray", "prayer"]}, {skill: "magic", match: ["mage", "magic"]},
    {skill: "runecrafting", match: ["rc", "runecraft", "runecrafting"]}, {skill: "hitpoints", match: ["hp", "hitpoints", "hitpoint"]}, {skill: "crafting", match: ["craft", "crafting"]},
    {skill: "mining", match: ["mine", "mining", "mineing"]}, {skill: "smithing", match: ["smith", "smithing"]}, {skill: "fishing", match: ["fish", "fishing"]},
    {skill: "cooking", match: ["cook", "cooking"]}, {skill: "firemaking", match: ["fm", "fming", "firemake", "firemaking"]},
    {skill: "woodcutting", match: ["wc", "wcing", "woodcut", "woodcutting"]}, {skill: "agility", match: ["agi", "agil", "agility"]}, {skill: "herblore", match: ["herb", "herblore"]},
    {skill: "thieving", match: ["thieve", "thieving", "theive", "theiving"]}, {skill: "fletching", match: ["fletch", "fletching"]}, {skill: "slayer", match: ["slay", "slayer"]},
    {skill: "farming", match: ["farm", "farming"]}, {skill: "construction", match: ["con", "cons", "construct", "construction"]}, {skill: "hunter", match: ["hunt", "hunter"]}
];

@singleton()
export class CmlService {
    constructor(private cmlHandler: CmlHandler, private memberHandler: MemberHandler, private configService: ConfigService, private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("update", (msg, args) => this.updatePlayer(msg, args), CommandType.Public);
        registerCallback("sotw", (msg, args) => this.skillOfTheWeek(msg, args), CommandType.Public);
        registerCallback("sotwlink", (msg) => this.link(msg), CommandType.Public);
        registerCallback("newcomp", (msg, args) => this.stageNewSotw(msg, args), CommandType.Private, (msg) => Guard.isSeniorMod(msg) || Guard.isToucann(msg));
        registerCallback("abandon", (msg) => this.abandonSotw(msg), CommandType.Private, (msg) => Guard.isSeniorMod(msg) || Guard.isToucann(msg));
        registerCallback("confirm", (msg) => this.confirmSotw(msg), CommandType.Private, (msg) => Guard.isSeniorMod(msg) || Guard.isToucann(msg));
        registerCallback("updateall", (msg) => this.updateAll(msg), CommandType.Private, (msg) => Guard.isSeniorMod(msg));

        this.logger.info("Registered 7 commands.", MOD);
    }

    updatePlayer(msg: Discord.Message, args: string[]) {
        var search: any;

        var getRSN = this.memberHandler.get(msg.author.username);

        search = getRSN;

        if (Guard.isSeniorMod(msg) || Guard.isToucann(msg)) {
            if (args && args.length > 0) {
                search = args.join("_");
            }
        }

        if (search === getRSN) {
            if (!getRSN) {
                msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>` first.");
                return;
            }

            search = getRSN.rsn;
        }

        msg.reply("just a second whilst CML updates...")
            .then((reply: Discord.Message) => {
                this.cmlHandler.updatePlayer(search, (content) => {
                    reply.delete();

                    if (content.indexOf('just updated less than') > -1) msg.reply("it's been less than 60 seconds since you were updated. Please wait a minute, and try again.");
                    else msg.reply(`updated RSN "${Formatter.formatRSN(search)}" successfully.`);
                });
            });
    }

    private updateAll(msg: Discord.Message) {
        msg.reply("on it. It may take a while, but I'll let you know when it's done.").then((reply: Discord.Message) => {
            this.cmlHandler.getGroup((group, cmlErr) => {
                if (!group && cmlErr) {
                    msg.reply(`CML says: "${cmlErr}"`);
                    return;
                }

                this.logger.info(`Found group ${group}. Getting userlist...`);
                this.cmlHandler.getUserList(group, (playerList, cmlErr) => {
                    if (!playerList && cmlErr) {
                        msg.reply(`CML had this to say: "${cmlErr}"`);
                        return;
                    }

                    var players = playerList.split('\n');

                    var count = players.length - 1;

                    this.logger.info(`Beginning update of ${count} players!`, MOD);

                    players.forEach((val: string) => {
                        if (!val) return;

                        this.cmlHandler.updatePlayer(val, () => {
                            count--;
                            this.logger.info(`A player finished updating. Remaining players: ${count}...`, MOD);

                            if (count === 0) {
                                reply.delete();
                                msg.reply("all competitors updated!");
                            }
                        });
                    });
                });
            });
        });
    }

    private skillOfTheWeek(msg: Discord.Message, args: string[]): void {
        this.sotw(msg, args, <Discord.TextChannel>msg.channel);
    }

    private sotw(msg: Discord.Message, args: string[], chan: Discord.TextChannel): void {
        var search = "";
        if (args && msg) {
            if (args.length < 1) {
                var getRSN = this.memberHandler.get(msg.author.username);

                if (getRSN) {
                    search = getRSN.rsn;
                }
            } else {
                search = args.join("_");
            }
        }

        this.cmlHandler.sotw((res) => {
            chan.send(res);
        }, 5, search);
    }

    private link(msg: Discord.Message): void {
        msg.reply(this.cmlHandler.sotwlink());
    }

    private stageNewSotw(msg: Discord.Message, args: string[]): void {
        var mappedSkill = skillMap.find((obj) => obj.match.indexOf(args[0].toLowerCase()) > -1);

        if (!mappedSkill) {
            msg.reply("I couldn't figure out which skill you meant. Please try again.");
            return;
        }

        var skill = mappedSkill.skill;

        this.logger.info("Getting group...");
        this.cmlHandler.getGroup((group, cmlErr) => {
            if (!group && cmlErr) {
                msg.reply(`CML says: "${cmlErr}"`);
                return;
            }

            this.logger.info(`Found group ${group}. Getting userlist...`);
            this.cmlHandler.getUserList(group, (playerList, cmlErr) => {
                if (!playerList && cmlErr) {
                    msg.reply(`CML had this to say: "${cmlErr}"`);
                    return;
                }

                this.logger.info("Found user list. Staging data...");
                this.cmlHandler.stageData(skill, (data) => {
                    var reply = "you're about to create a new SOTW with the following details:\n\n";
                    reply += `Competition Name: ${data.find((obj) => obj.name === "title").value}\n`;
                    reply += `Competition Start: Today at ${data.find((obj) => obj.name === "start_time").value} GMT\n`;
                    reply += `Competition End: ${moment(data.find((obj) => obj.name === "end_date").value).format('Do [of] MMMM')} at ${data.find((obj) => obj.name === "end_time").value} GMT\n`;
                    reply += `Skill: ${skill[0].toUpperCase() + skill.substring(1)}\n`;
                    reply += `Players: ${data.find((obj) => obj.name === "players").value.split('\n').length - 1}\n\n`;
                    reply += "Do you wish to proceed? Use `&confirm` or `&abandon`.";

                    msg.reply(reply);
                });
            });
        });
    }

    private abandonSotw(msg: Discord.Message): void {
        this.cmlHandler.abandonComp((content) => msg.reply(content));
    }

    private confirmSotw(msg: Discord.Message): void {
        this.cmlHandler.createNewComp((compId, data) => {
            var datetime = `${data.find((obj) => obj.name === "start_date").value}T${data.find((obj) => obj.name === "start_time").value}Z`;
    
            this.configService.updateSotw(datetime, compId);
    
            msg.reply("competition set-up successfully. I'll ping the Athletes when the competition begins.");
        });
    }
};