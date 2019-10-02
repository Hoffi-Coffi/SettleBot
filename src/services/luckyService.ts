import { injectable } from "tsyringe";
import * as Discord from "discord.js";

import { Logger } from "../utilities/logger";
import { CommandType } from "../handlers/commandHandler";

const MOD = "luckyService.ts";

enum LuckyLoot {
    RCB = "rcb", NOTHING = "nothing", RANGERS = "rangers", MANACLES = "manacles", SANDALS = "sandals",
    TAHELM = "3a full helm", TAPBODY = "3a platebody", TAPLEGS = "3a platelegs", TAPSKIRT = "3a plateskirt",
    TAKITE = "3a kiteshield", TACOIF = "3a range coif", TARTOP = "3a range top", TARLEGS = "3a range legs",
    TAVAMBS = "3a vambraces", TAMHAT = "3a mage hat", TAROBETOP = "3a robe top", TAROBE = "3a robe",
    TAAMMY = "3a amulet", TADROBETOP = "3a druidic robe top", TADROBEBOT = "3a druidic robe bottoms",
    TADCLOAK = "3a druidic cloak", TALONG = "3a longsword", TABOW = "3a bow", TAWAND = "3a wand",
    TADSTAFF = "3a druidic staff", TACLOAK = "3a cloak", TAPICK = "3a pickaxe", TAAXE = "3a axe",
    GODCLOAK = "cloak", GODBOOTS = "d'hide boots"
}

@injectable()
export class LuckyService {
    private mediumLoot: LuckyLoot[] = [LuckyLoot.RANGERS, LuckyLoot.MANACLES, LuckyLoot.SANDALS];
    private hardLoot: LuckyLoot[] = [LuckyLoot.TAHELM, LuckyLoot.TAPBODY, LuckyLoot.TAPLEGS, LuckyLoot.TAPSKIRT, 
        LuckyLoot.TAKITE, LuckyLoot.TACOIF, LuckyLoot.TARTOP, LuckyLoot.TARLEGS, LuckyLoot.TAVAMBS, 
        LuckyLoot.TAMHAT, LuckyLoot.TAROBETOP, LuckyLoot.TAROBE, LuckyLoot.TAAMMY];
    private masterLoot: LuckyLoot[] = [LuckyLoot.TAHELM, LuckyLoot.TAPBODY, LuckyLoot.TAPLEGS, LuckyLoot.TAPSKIRT, 
        LuckyLoot.TAKITE, LuckyLoot.TACOIF, LuckyLoot.TARTOP, LuckyLoot.TARLEGS, LuckyLoot.TAVAMBS, 
        LuckyLoot.TAMHAT, LuckyLoot.TAROBETOP, LuckyLoot.TAROBE, LuckyLoot.TAAMMY, LuckyLoot.TADROBETOP,
        LuckyLoot.TADROBEBOT, LuckyLoot.TADCLOAK, LuckyLoot.TALONG, LuckyLoot.TABOW, LuckyLoot.TAWAND,
        LuckyLoot.TADSTAFF, LuckyLoot.TACLOAK, LuckyLoot.TAPICK, LuckyLoot.TAAXE];
    private gods: string[] = ["Saradomin", "Guthix", "Zamorak", "Armadyl", "Bandos", "Ancient"];

    constructor(private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("lucky", (msg, args) => this.rollLuckies(msg, args), CommandType.Public);

        this.logger.info("Registered 1 command.", MOD);
    }

    rollLuckies(msg: Discord.Message, args: string[]): void {
        var chan: Discord.TextChannel = <Discord.TextChannel>msg.channel;

        if (chan && chan.name !== "bot-channel") return;

        var luckies = 1;
        if (args.length > 0) {
            var inp = parseInt(args[0]);

            if (!isNaN(inp)) luckies = inp;
        }

        if (luckies < 1) luckies = 1;
        else if (luckies > 1000) luckies = 1000;

        var rcbs = [], otherDrops = [];

        for (var i = 1; i < (luckies + 1); i++) {
            var roll = this.rollLimp();

            if (roll === LuckyLoot.RCB) rcbs.push(i);
            else if (roll !== LuckyLoot.NOTHING) {
                var find = otherDrops.find((item) => item.name === roll);

                if (find) {
                    otherDrops.splice(otherDrops.indexOf(find), 1);

                    find.count = find.count + 1;

                    otherDrops.push(find);
                } else {
                    otherDrops.push({name: roll, count: 1});
                }
            }
        }

        var res = this.buildResponse(luckies, rcbs, otherDrops);
        msg.reply(res);
    }

    private buildResponse(luckies: number, rcbs: number[], otherDrops: {name: string, count: number}[]): string {
        var res = "";
        var rcbCount = rcbs.length;
        
        if (rcbCount === 0) {
            if (luckies === 1) res = "you didn't get the <:rcb:606951030336389153> :(";
            else if (luckies < 100) res = `you didn't get an <:rcb:606951030336389153> in ${luckies} lucky implings :(`;
            else res = `you didn't get a single <:rcb:606951030336389153> in ${luckies.toLocaleString()} lucky implings :(`;

            if (otherDrops.length > 0) {
                res += " but, you did get: ";
                res += this.formatOtherDrops(otherDrops);
            } 
        } else {
            if (luckies === 1) res = "holy frick! you got the <:rcb:606951030336389153>!!!!";
            else {
                res = `out of ${luckies.toLocaleString()} lucky implings, you got a <:rcb:606951030336389153> from lucky impling #${rcbs.join(', #')}!`;

                if (otherDrops.length > 0) {
                    res += " You also got: ";
                    res += this.formatOtherDrops(otherDrops);
                }
            }
        }

        return res;
    }

    private formatOtherDrops(otherDrops: {name: string, count: number}[]): string {
        var formattedDrops = [];
        otherDrops.forEach((item) => {
            var name = item.name;
            if (name === LuckyLoot.GODBOOTS || name === LuckyLoot.GODCLOAK) {
                var god = this.gods[this.getRandomInt(0, 5)];
                name = god + " " + name;
            }
            formattedDrops.push(`${item.count}x ${name}`);
        });

        return formattedDrops.join(", ");
    }

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private rollLimp(): LuckyLoot {
        var tier = this.getRandomInt(1, 5);

        switch (tier) {
            case 2:
                //rolled medium
                var lootRoll = this.getRandomInt(1, 1133);

                if (lootRoll < 4) return this.mediumLoot[(lootRoll - 1)];
                if (lootRoll < 10) return LuckyLoot.GODCLOAK;
                break;
            case 3:
                //rolled hard
                var lootRoll = this.getRandomInt(1, 211250);

                if (lootRoll < 14) return this.hardLoot[(lootRoll - 1)];
                if (lootRoll >= 14 && lootRoll <= (14 + (130 * 6))) return LuckyLoot.GODBOOTS;
                break;
            case 4:
                //rolled elite
                var lootRoll = this.getRandomInt(1, 323);

                if (lootRoll >= 1 && lootRoll <= 10) return LuckyLoot.RCB;
                break;
            case 5:
                //rolled master
                var lootRoll = this.getRandomInt(1, 313168);

                if (lootRoll < 24) return this.masterLoot[(lootRoll - 1)];
                break;
        }

        return LuckyLoot.NOTHING;
    }
}