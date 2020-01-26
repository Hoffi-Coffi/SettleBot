import Discord from "discord.js";
import moment from "moment";

import { singleton } from "tsyringe";
import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Guard from "../utilities/guard";
import ServerUtils from "../utilities/serverUtils";
import { SotwAdminHandler } from "../handlers/sotwAdminHandler";
import { CommandType, SotwCompetition, OsrsSkill, SotwCompetitor } from "../utilities/models";
import Formatter from "../utilities/formatter";
import { OsrsHandler } from "../handlers/osrsHandler";
import { SotwHandler } from "../handlers/sotwHandler";
import TableBuilder, { Table } from "../utilities/tableBuilder";
import { SkillsHandler } from "../handlers/skillsHandler";

const MOD = "sotwAdminService.ts";

const skillTopicMap = [
    {skill: "Combat", topic: "hit thing :crossed_swords:"},
    {skill: "Ranged", topic: "yeeting :bow_and_arrow:"}, 
    {skill: "Prayer", topic: "bothering deities :pray:"}, 
    {skill: "Magic", topic: "splashing"},
    {skill: "Runecraft", topic: "make magic rocks"}, 
    {skill: "Crafting", topic: "make thing :tools:"},
    {skill: "Mining", topic: "hit rock :pick:"}, 
    {skill: "Smithing", topic: "armour make :hammer:"}, 
    {skill: "Fishing", topic: "obtain swimmers :fish:"},
    {skill: "Cooking", topic: "food"}, 
    {skill: "Firemaking", topic: "burn stuff"}, 
    {skill: "Woodcutting", topic: "chop wood :deciduous_tree: :evergreen_tree:"},
    {skill: "Agility", topic: "gotta go fast"}, 
    {skill: "Herblore", topic: "uim's worst nightmare"}, 
    {skill: "Thieving", topic: "illegal activities"},
    {skill: "Fletching", topic: "make stuff to yeet"}, 
    {skill: "Slayer", topic: "kill specific stuff"}, 
    {skill: "Farming", topic: "grow stuff"},
    {skill: "Construction", topic: "build stuff"}, 
    {skill: "Hunter", topic: "catch animal"}, 
    {skill: "Overall", topic: "EVERYTHING!"}
];

const skillMap = [
    {skill: "ranged", match: ["range", "ranged", "ranging"]}, 
    {skill: "prayer", match: ["pray", "prayer"]}, 
    {skill: "magic", match: ["mage", "magic"]},
    {skill: "runecraft", match: ["rc", "runecraft", "runecrafting"]}, 
    {skill: "combat", match: ["combat", "cmb"]}, 
    {skill: "crafting", match: ["craft", "crafting"]},
    {skill: "mining", match: ["mine", "mining", "mineing"]}, 
    {skill: "smithing", match: ["smith", "smithing"]}, 
    {skill: "fishing", match: ["fish", "fishing"]},
    {skill: "cooking", match: ["cook", "cooking"]}, 
    {skill: "firemaking", match: ["fm", "fming", "firemake", "firemaking"]},
    {skill: "woodcutting", match: ["wc", "wcing", "woodcut", "woodcutting"]}, 
    {skill: "agility", match: ["agi", "agil", "agility"]},
    {skill: "herblore", match: ["herb", "herblore"]},
    {skill: "thieving", match: ["thieve", "thieving", "theive", "theiving"]},
    {skill: "fletching", match: ["fletch", "fletching"]}, 
    {skill: "slayer", match: ["slay", "slayer"]},
    {skill: "farming", match: ["farm", "farming"]}, 
    {skill: "construction", match: ["con", "cons", "construct", "construction"]}, 
    {skill: "hunter", match: ["hunt", "hunter"]},
    {skill: "overall", match: ["overall", "all"]}
];

@singleton()
export class SotwAdminService {
    private competitorRole: Discord.Role;
    private champRole: Discord.Role;
    private sotwChannel: Discord.TextChannel;
    private server: Discord.Guild;

    constructor(private memberHandler: MemberHandler,
        private osrsHandler: OsrsHandler,
        private sotwHandler: SotwHandler,
        private sotwAdminHandler: SotwAdminHandler,
        private skillsHandler: SkillsHandler,
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("joincomp", (msg) => this.joinComp(msg), CommandType.Public, (msg) => Guard.isChannelOrMod(msg, ["sotw-bot"]));
        registerCallback("sotw", (msg, args) => this.skillOfTheWeek(msg, args), CommandType.Public, (msg) => Guard.isChannelOrMod(msg, ["sotw-bot"]));
        registerCallback("update", (msg, args) => this.updatePlayer(msg, args), CommandType.Public, (msg) => Guard.isChannelOrMod(msg, ["sotw-bot"]));

        registerCallback("sotwall", (msg) => this.skillOfTheWeekAll(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));

        registerCallback("updateall", (msg) => this.updateAllPlayers(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback("newcomp", (msg, args) => this.stageNewSotw(msg, args), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback("abandon", (msg) => this.abandonSotw(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback("confirm", (msg) => this.confirmSotw(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));

        this.logger.info("Registered 8 commands.", MOD);
    }

    setup(_competitorRole: Discord.Role, _champRole: Discord.Role, _sotwChannel: Discord.GuildChannel, _server: Discord.Guild): void {
        this.competitorRole = _competitorRole;
        this.champRole = _champRole;
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;
        this.server = _server;

        this.updateTopic();
        this.setupTimeouts();

        if (!this.champRole) this.logger.warn("Couldn't find a champion role.", MOD);
        if (!this.competitorRole) this.logger.warn("Couldn't find a competitor role.", MOD);
        if (!this.sotwChannel) this.logger.warn("Couldn't find a SOTW channel", MOD);
    }

    private stageNewSotw(msg: Discord.Message, args: string[]): void {
        if (args.length < 1) {
            msg.reply("You must specify a skill.");
            return;
        }

        var mappedSkill = skillMap.find((obj) => obj.match.indexOf(args[0].toLowerCase()) > -1);

        if (!mappedSkill) {
            msg.reply("I couldn't figure out which skill you meant. Please try again.");
            return;
        }

        var skill = mappedSkill.skill;
        var now = new Date();
        now.setMinutes(Math.ceil(now.getUTCMinutes() / 30) * 30);
        var day = now.getUTCDate().toString();
        if (now.getUTCDate() < 10) day = "0" + day;

        var end = new Date(now);
        end.setDate(end.getUTCDate() + 7);
        var dayEnd = end.getUTCDate().toString();
        if (end.getUTCDate() < 10) dayEnd = "0" + dayEnd;

        var time = Formatter.convertTime(`${now.getUTCHours()}:${now.getUTCMinutes()}`, null);

        var start = `${now.getUTCFullYear()}-${Formatter.mapMonth(now.getUTCMonth()+1)}-${day}T${time}`;
        var endDate = `${end.getUTCFullYear()}-${Formatter.mapMonth(end.getUTCMonth()+1)}-${dayEnd}T${time}`;

        var competition: SotwCompetition = {
            skill: skill,
            dateStart: start,
            dateEnd: endDate,
            competitors: []            
        };

        this.logger.info("Staging SOTW data...");
        this.sotwHandler.stageNewComp(competition);

        var reply = "You're about to create a new SOTW with the following details:\n";
        reply += `Competition Start: Today at ${moment(start).format('hh:mm A')}\n`;
        reply += `Competition End: ${moment(endDate).format('Do [of] MMMM [at] hh:mm A')}\n`;
        reply += `Skill: ${skill[0].toUpperCase() + skill.substring(1)}\n`;
        reply += "Do you wish to proceed? Use `&confirm` or `&abandon`.";

        msg.reply(reply);
    }

    private abandonSotw(msg: Discord.Message): void {
        var abandoned = this.sotwHandler.abandonStagedComp();

        if (abandoned) msg.reply("The staged SOTW has been abandoned.");
        else msg.reply("There was no staged SOTW to abandon.");
    }

    private updateAllPlayers(msg: Discord.Message): void {
        this.doBulkUpdate((res) => msg.reply(res));
    }

    private doBulkUpdate(callback?: (res: string) => void): void {
        var comp = this.sotwHandler.getActiveComp();

        if (!comp) {
            if (callback) callback("There isn't an active competition.");
            return;
        }

        var count = comp.competitors.length - 1;
        this.logger.info(`Beginning bulk update of ${count} players...`, MOD);

        comp.competitors.forEach((obj) => {
            this.osrsHandler.getPlayer(obj.rsn, (player) => {
                count--;

                if (count < 0) return;

                if (!player) {
                    this.logger.warn(`Couldn't update RSN "${obj.rsn}" - not found on hiscores.`);
                    return;
                }

                var exp = 0;

                // Handle "Combat" skill a little differently.
                if (comp.skill === "combat") {
                    var att = player.skills.attack;
                    var str = player.skills.strength;
                    var def = player.skills.defence;
                    var hp = player.skills.hitpoints;

                    if (att) exp += att.exp;
                    if (str) exp += str.exp;
                    if (def) exp += def.exp;
                    if (hp) exp += hp.exp;

                    if (exp === 0) {
                        this.logger.warn(`Couldn't update RSN "${obj.rsn}" - not ranked in any Combat skills.`, MOD);
                        return;
                    }
                } else {
                    var skill: OsrsSkill = player.skills[comp.skill];
                    if (!skill) {
                        this.logger.warn(`Couldn't update RSN "${obj.rsn}" - not ranked for SOTW skill.`, MOD);
                        return;
                    }
                    exp = skill.exp;
                }

                obj.endExp = exp;
                this.sotwHandler.addOrUpdateCompetitor(obj);

                this.logger.info(`A player finished updating. Remaining players: ${count}...`);

                if (count === 0 && callback) {
                    callback("All competitors updated!");
                }
            });
        });
    }

    private updatePlayer(msg: Discord.Message, args: string[]): void {
        var search: any;

        var getRSN = this.memberHandler.getById(msg.author.id);

        search = getRSN;

        if (Guard.isSeniorMod(msg)) {
            if (args && args.length > 0) {
                search = args.join("_").toLowerCase();
            }
        }

        if (search === getRSN) {
            if (!getRSN) {
                msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>` first.");
                return;
            }

            search = getRSN.rsn;
        }

        var comp = this.sotwHandler.getActiveComp();

        if (!comp) {
            msg.reply("there's no active competition!");
            return;
        }

        if (moment(comp.dateEnd).isBefore(moment())) {
            msg.reply("the competition has already ended.");
            return;
        }

        var found = comp.competitors.find((obj) => Formatter.formatRSN(obj.rsn.toLowerCase()) === Formatter.formatRSN(search));

        if (!found) {
            msg.reply("you're not in the current competition. Use `&joincomp` if you'd like to compete.");
            return;
        }

        this.osrsHandler.getPlayer(found.rsn, (player) => {
            if (!player) {
                msg.reply("I couldn't find you on the OSRS Hiscores.");
                return;
            }

            var exp = 0;

            // Handle "Combat" skill a little differently.
            if (comp.skill === "combat") {
                var att = player.skills.attack;
                var str = player.skills.strength;
                var def = player.skills.defence;
                var hp = player.skills.hitpoints;

                if (att) exp += att.exp;
                if (str) exp += str.exp;
                if (def) exp += def.exp;
                if (hp) exp += hp.exp;

                if (exp === 0) {
                    msg.reply(`you don't seem to be ranked in any Combat skills, so I can't update you.`);
                    return;
                }
            } else {
                var skill: OsrsSkill = player.skills[comp.skill];
                if (!skill) {
                    msg.reply(`you don't seem to be ranked in ${comp.skill[0].toUpperCase() + comp.skill.substring(1)}, so I can't update you.`);
                    return;
                }
                exp = skill.exp;
            }

            found.endExp = exp;
            this.sotwHandler.addOrUpdateCompetitor(found);

            msg.reply(`updated RSN "${Formatter.formatRSN(found.rsn)}" successfully!`);
        });
    }

    private joinComp(msg: Discord.Message): void {
        var getRSN = this.memberHandler.getById(msg.author.id);

        if (!getRSN) {
            msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>` first.");
            return;
        }

        var comp = this.sotwHandler.getActiveComp();
        var stagedComp = this.sotwHandler.getStagedComp();

        if (comp && moment(comp.dateEnd).isAfter(moment())) {
            // Comp is currently running.
            var found = comp.competitors.find((comp) => comp.rsn === getRSN.rsn)
            if (found) {
                msg.reply("you're already in the competition!");
                return;
            }

            this.osrsHandler.getPlayer(getRSN.rsn, (player) => {
                if (!player) {
                    msg.reply("I couldn't find you on the OSRS Hiscores!");
                    return;
                }

                var skill: OsrsSkill = player.skills[comp.skill];

                if (!skill) {
                    msg.reply(`I found you on the OSRS Hiscores, but you don't seem to be ranked in ${comp.skill[0].toUpperCase() + comp.skill.substring(1)}, so I can't add you to the competition.`);
                    return;
                }

                var competitor: SotwCompetitor = {
                    rsn: getRSN.rsn,
                    startExp: skill.exp,
                    endExp: skill.exp
                };

                this.sotwHandler.addOrUpdateCompetitor(competitor);
                ServerUtils.addRoleToUser(msg.guild.member(msg.author), this.competitorRole);

                msg.reply("I've added you to the current competition.");
            });
        } else if (stagedComp) {
            // A comp is currently staged.
            var found = stagedComp.competitors.find((comp) => comp.rsn === getRSN.rsn)
            if (found) {
                msg.reply("you're already on the list for the next competition. I'll let you know when it starts.");
                return;
            }

            this.osrsHandler.getPlayer(getRSN.rsn, (player) => {
                if (!player) return;

                var exp = 0;

                // Handle "Combat" skill a little differently.
                if (stagedComp.skill === "combat") {
                    var att = player.skills.attack;
                    var str = player.skills.strength;
                    var def = player.skills.defence;
                    var hp = player.skills.hitpoints;

                    if (att) exp += att.exp;
                    if (str) exp += str.exp;
                    if (def) exp += def.exp;
                    if (hp) exp += hp.exp;

                    if (exp === 0) return;
                } else {
                    var skill: OsrsSkill = player.skills[stagedComp.skill];
                    if (!skill) return;

                    exp = skill.exp;
                }

                var competitor: SotwCompetitor = {
                    rsn: getRSN.rsn,
                    startExp: exp,
                    endExp: exp
                };

                this.sotwHandler.addStagedCompetitor(competitor);
                ServerUtils.addRoleToUser(msg.guild.member(msg.author), this.competitorRole);

                msg.reply("I've added you to the list. I'll let you know when the next competition starts.");
            });
        } else {
            // No comp is currently running.
            var added = this.sotwAdminHandler.addCompetitor(getRSN);

            if (added) msg.reply("I've added you to the list. I'll let you know when the next competition starts.");
            else msg.reply("you're already on the list for the next competition. I'll let you know when it starts.");
        }
    }

    private confirmSotw(msg: Discord.Message): void {
        var competition = this.sotwHandler.getStagedComp();

        if (!competition) {
            msg.reply("There's no staged SOTW.");
            return;
        }

        this.skillsHandler.setSkillCompeted(competition.skill);

        this.sotwAdminHandler.getCompetitors().forEach(comp => {
            var memb = this.server.member(comp.id);

            if (memb) {
                ServerUtils.addRoleToUser(memb, this.competitorRole);

                this.osrsHandler.getPlayer(comp.rsn, (player) => {
                    if (!player) return;

                    var stagedComp = this.sotwHandler.getStagedComp();

                    var exp = 0;

                    // Handle "Combat" skill a little differently.
                    if (stagedComp.skill === "combat") {
                        var att = player.skills.attack;
                        var str = player.skills.strength;
                        var def = player.skills.defence;
                        var hp = player.skills.hitpoints;

                        if (att) exp += att.exp;
                        if (str) exp += str.exp;
                        if (def) exp += def.exp;
                        if (hp) exp += hp.exp;

                        if (exp === 0) return;
                    } else {
                        var skill: OsrsSkill = player.skills[stagedComp.skill];
                        if (!skill) return;

                        exp = skill.exp;
                    }

                    this.sotwHandler.addStagedCompetitor({
                        rsn: comp.rsn,
                        startExp: exp,
                        endExp: exp
                    });
                });
            }
        });

        var startMillis = moment(competition.dateStart).valueOf();
        var nowMillis = moment().valueOf();

        var diff = (startMillis - nowMillis) + 30000;

        setTimeout(() => {
            var activated = this.sotwHandler.activateStagedComp();

            if (!activated) return;

            this.autoUpdateLoop();
            this.updateTopic();
            this.setupTimeouts();

            this.competitorRole.setMentionable(true).then(() => {
                this.sotwChannel.send(`${this.competitorRole}, a new Skill Of The Week competition has begun!`)
                    .then(() => {
                        var comp = this.sotwHandler.getActiveComp();
                        if (!comp) return;

                        var res = this.sotw(comp);
                        this.sotwChannel.send(res);
                        this.competitorRole.setMentionable(false);
                    });
            });
        }, diff);

        msg.reply("All set up! I'll ping everyone when the competition starts.");
    }

    private skillOfTheWeekAll(msg: Discord.Message) {
        var comp = this.sotwHandler.getActiveComp();

        var res = this.sotw(comp, "", -1);
        if (res.length > 2000) {
            msg.reply(res.substring(0, 1996) + "```");
            msg.reply("```" + res.substring(1997, res.length));
        }
        else msg.reply(res);
    }

    private skillOfTheWeek(msg: Discord.Message, args: string[]) {
        var comp = this.sotwHandler.getActiveComp();

        if (!comp) {
            msg.reply("There's no competition running at the moment!");
            return;
        }

        var search = "";
        if (args && msg) {
            if (args.length < 1) {
                var getRSN = this.memberHandler.getById(msg.author.id);

                if (getRSN) {
                    search = Formatter.formatRSN(getRSN.rsn.toLowerCase());
                }
            } else {
                search = Formatter.formatRSN(args.join("_").toLowerCase());
            }
        }

        var res = this.sotw(comp, search);
        msg.channel.send(res);
    }

    private sotw(comp: SotwCompetition, search?: string, limit: number = 5): string {
        var sotwEnd = moment(comp.dateEnd);
        var endWord = (sotwEnd.isBefore(moment())) ? "Ended" : "Ends";
        var tableHeader = [
            `Skill: ${comp.skill[0].toUpperCase() + comp.skill.substring(1)}`,
            `Started: ${moment(comp.dateStart).format('Do MMM YYYY h:mmA')} GMT`,
            `${endWord}: ${sotwEnd.format('Do MMM YYYY, h:mmA')} GMT`
        ];

        if (sotwEnd.isAfter(moment())) tableHeader.push(`Ends ${sotwEnd.fromNow()}`);

        var searchFound = false;
        if (!search) searchFound = true;

        var competitors = comp.competitors.sort((a, b) => (b.endExp - b.startExp) - (a.endExp - a.startExp));

        var cells: string[][] = [];
        competitors.forEach((comp, idx) => {
            if (limit > 0 && idx + 1 > limit) return;
            var rsn = Formatter.formatRSN(comp.rsn);

            var row = [
                (idx + 1).toString(),
                rsn,
                comp.startExp.toLocaleString(),
                comp.endExp.toLocaleString(),
                (comp.endExp - comp.startExp).toLocaleString()
            ];

            cells.push(row);

            if (search && search === rsn) searchFound = true;
        });

        var reduce = 0;

        if (!searchFound) {
            // Searched RSN is not in top-N.
            var found = competitors.find((obj) => Formatter.formatRSN(obj.rsn).toLowerCase() === search.toLowerCase());

            if (found) {
                reduce++;

                cells.push(["..", "..", "..", "..", ".."]);

                var row = [
                    (competitors.indexOf(found) + 1).toString(),
                    Formatter.formatRSN(found.rsn),
                    found.startExp.toLocaleString(),
                    found.endExp.toLocaleString(),
                    (found.endExp - found.startExp).toLocaleString()
                ];

                cells.push(row);
            }
        }

        var foot = undefined;
        if (competitors.length > limit) {
            foot = [`...plus ${competitors.length - limit - reduce} more...`];
        }

        var table: Table = {
            header: tableHeader,
            columns: ["Pos.", "RSN", "Start", "End", "Gain"],
            rows: cells,
            footer: foot
        };

        var result = TableBuilder.build(table);

        return "```" + result + "```";
    }

    private updateTopic() {
        var comp = this.sotwHandler.getActiveComp();

        if (!comp) return;

        var skill = comp.skill;

        if (!skill) return;

        var mappedTopic = skillTopicMap.find((obj) => obj.skill === skill[0].toUpperCase() + skill.substring(1)).topic;

        if (!mappedTopic) mappedTopic = skill;

        var topic = `this week we are training ${mappedTopic} || &sotwinfo for more info`;

        if (this.sotwChannel.topic !== topic) this.sotwChannel.setTopic(topic);
    }

    private autoUpdateLoop(): void {
        var comp = this.sotwHandler.getActiveComp();

        if (!comp) return;

        var end = comp.dateEnd;
        if (!end) return;

        var endMillis = moment(end).valueOf();
        var nowMillis = moment().valueOf();
        var diff = endMillis - nowMillis;

        if (diff < 0) return;

        var nextUpdate = nowMillis + (60000 * 30 * 6);
        if (nextUpdate < endMillis) {
            this.doBulkUpdate((res) => this.logger.info(res, MOD));
            this.logger.info(`Scheduling next bulk update 6 hours from now...`, MOD);
            setTimeout(() => {
                this.autoUpdateLoop();
            }, (60000 * 30 * 6));
        }
    }

    private setupTimeouts(): void {
        var comp = this.sotwHandler.getActiveComp();

        if (!comp) return;

        var end = comp.dateEnd;

        if (!end) return; 
        
        var endMillis = moment(end).valueOf();
        var nowMillis = moment().valueOf();
        var diff = endMillis - nowMillis;

        if (diff < 0) return;

        this.autoUpdateLoop();

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
                        var comp = this.sotwHandler.getActiveComp();
                        if (!comp) return;

                        var res = this.sotw(comp);
                        this.sotwChannel.send(res);
                        this.competitorRole.setMentionable(false);
                        ServerUtils.emptyRole(this.competitorRole);
                        this.sotwAdminHandler.clearCompetitors();

                        var winner = comp.competitors.sort((a, b) => (b.endExp - b.startExp) - (a.endExp - a.startExp))[0];
                        this.sotwChannel.send(`Congratulations to ${winner.rsn} for winning the ${comp.skill[0].toUpperCase() + comp.skill.substring(1)} competition!\n\nRemember to sign-up for the next competition using \`&joincomp\`!`);

                        var expertRole = this.sotwChannel.guild.roles.find((role) => role.name == `${comp.skill[0].toUpperCase() + comp.skill.substring(1)} Expert`);
                        if (expertRole) {
                            ServerUtils.emptyRole(expertRole);

                            var winnerMember = this.sotwChannel.guild.member(this.memberHandler.getByRsn(winner.rsn).id);
                            if (winnerMember) {
                                var rolesToAdd: Discord.Role[] = [];
                                if (!winnerMember.roles.find((role) => role === this.champRole)) rolesToAdd.push(this.champRole);
                                if (!winnerMember.roles.find((role) => role === expertRole)) rolesToAdd.push(expertRole);

                                if (rolesToAdd.length > 0) winnerMember.addRoles(rolesToAdd);
                            }
                        }
                    });
            });
        }, (diff + 30000));
    }
}