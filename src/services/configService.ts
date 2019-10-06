import { singleton } from "tsyringe";
import moment from "moment";
import * as Discord from "discord.js";

import { MemberService } from "./memberService";

import { CmlHandler } from "../handlers/cmlHandler";
import { ConfigHandler } from "../handlers/configHandler";

import { Logger } from "../utilities/logger";
import Guard from "../utilities/guard";
import { CommandType } from "../handlers/commandHandler";

const MOD = "configService.ts";

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
export class ConfigService {
    private sotwChannel: Discord.TextChannel;

    constructor(private memberService: MemberService, private cmlHandler: CmlHandler, private configHandler: ConfigHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("setconfig", (msg, args) => this.setConfig(msg, args), CommandType.Private, (msg) => Guard.isSeniorModPriv(msg));

        this.logger.info("Registered 1 command.", MOD);
    }

    setup(_sotwChannel: Discord.GuildChannel): void {
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;

        this.setupTimeouts();
        this.updateTopic();

        if (!this.sotwChannel) this.logger.warn("Couldn't find SOTW channel.", MOD);
    }

    getSotwChannel(): Discord.TextChannel {
        return this.sotwChannel;
    }

    updateSotw(startDatetime: string, sotwCompId: string): void {
        var startMillis = moment(startDatetime).valueOf();
        var nowMillis = moment().valueOf();

        var diff = (startMillis - nowMillis) + 30000;

        setTimeout(() => {
            this.configHandler.updateSetting("sotwCompId", sotwCompId, () => {
                this.cmlHandler.scrape(() => {
                    this.updateTopic();
                    this.setupTimeouts();

                    var athleteRole = this.memberService.getAthleteRole();
                    athleteRole.setMentionable(true).then(() => {
                        this.sotwChannel.send(`${athleteRole}, a new Skill Of The Week competition has begun!`)
                            .then(() => {
                                this.cmlHandler.sotw((res: string) => {
                                    this.sotwChannel.send(res);
                                }, 5);
                                athleteRole.setMentionable(false);
                            });
                    });
                }, sotwCompId);
            });
        }, diff);
    }

    private updateTopic() {
        var skill = this.configHandler.getSetting("sotwskill");

        var mappedTopic = skillTopicMap.find((obj) => obj.skill === skill).topic;

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
                this.memberService.getAthleteRole().setMentionable(true).then(() => {
                    this.sotwChannel.send(`${this.memberService.getAthleteRole()}, the competition ends in 30 minutes! Remember to logout of OSRS and use the \`&update\` command before the competition ends.`)
                        .then(() => {
                            this.memberService.getAthleteRole().setMentionable(false);
                        });
                });
            }, (diff - (60000 * 30)));
        }

        this.logger.info(`Setting an ending timeout for ${Math.ceil(((diff + 30000) / 1000) / 60)} minutes from now...`, MOD);
        setTimeout(() => {
            this.memberService.getAthleteRole().setMentionable(true).then(() => {
                this.sotwChannel.send(`${this.memberService.getAthleteRole()}, the competition has ended! Let's take a look at the final results...`)
                    .then(() => {
                        this.cmlHandler.sotw((res: string) => {
                            this.sotwChannel.send(res);
                        }, 5);
                        this.memberService.getAthleteRole().setMentionable(false);
                    });
            });
        }, (diff + 30000));
    }

    private setConfig(msg: Discord.Message, args: string[]): void {
        if (args.length < 2) {
            msg.reply("you must provide a config name and value. Usage: `&setconfig <name> <value>`");
            return;
        }
    
        var callback = undefined;
    
        if (args[0].trim().toLowerCase() === 'sotwcompid') {
            callback = () => {
                this.cmlHandler.scrape(() => {
                    this.updateTopic();
                    this.setupTimeouts();
    
                    this.memberService.getAthleteRole().setMentionable(true).then(() => {
                        this.sotwChannel.send(`${this.memberService.getAthleteRole()}, a new Skill Of The Week competition has begun!`)
                            .then(() => {
                                this.cmlHandler.sotw((res: string) => {
                                    this.sotwChannel.send(res);
                                }, 5);
                                this.memberService.getAthleteRole().setMentionable(false);
                            });
                    });
                });
            }
        }
    
        this.configHandler.updateSetting(args[0], args[1], callback);
    
        msg.reply("updated!");
    }
};