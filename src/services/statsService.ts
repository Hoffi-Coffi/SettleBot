import { injectable, singleton } from "tsyringe";
import Discord from "discord.js";
import Canvas from "canvas";

import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import TableBuilder, { Table } from "../utilities/tableBuilder";
import { CommandType, OsrsSkill } from "../utilities/models";
import { OsrsHandler } from "../handlers/osrsHandler";
import Guard from "../utilities/guard";

const MOD = "statsService.ts";

const positionMap = {
    attack: [40, 22],
    overall: [0, 0],
    defence: [40, 86],
    strength: [40, 54],
    hitpoints: [104, 22],
    ranged: [40, 118],
    prayer: [40, 150],
    magic: [40, 182],
    cooking: [168, 118],
    woodcutting: [168, 182],
    fletching: [104, 182],
    fishing: [168, 86],
    firemaking: [168, 150],
    crafting: [104, 150],
    smithing: [168, 54],
    mining: [168, 22],
    herblore: [104, 86],
    agility: [104, 54],
    thieving: [104, 118],
    slayer: [104, 214],
    farming: [168, 214],
    runecraft: [40, 214],
    hunter: [104, 246],
    construction: [40, 246]
};

@singleton()
export class StatsService {
    private statsBg: Canvas.Image;

    constructor(private memberHandler: MemberHandler, 
        private osrsHandler: OsrsHandler,
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("stats", (msg, args) => this.getPlayerStats(msg, args), CommandType.Public, (msg) => Guard.isBotChannelOrMod(msg));

        Canvas.loadImage("./statsbg.png").then((img) => {
            this.statsBg = img;
        });

        this.logger.info("Registered 1 command.", MOD);
    }

    private getPlayerStats(msg: Discord.Message, args: string[]): void {
        var search: any;

        var player = this.memberHandler.getById(msg.author.id);

        search = player;

        if (args && args.length > 0) search = args.join("_");

        if (search === player) {
            if (!player) {
                msg.reply("you need to register your RSN with me before you can use this command without providing an RSN. Try `&register <rsn>` first, or use `&stats <rsn>`.");
                return;
            }

            search = player.rsn;
        }

        if (search.toLowerCase() === 'swampletics') {
            msg.reply("no spoilers pls 😡😡😡");
            return;
        }

        this.osrsHandler.getPlayerStats(search, (player) => {
            if (!player) {
                msg.reply("I can't find that RSN on the OSRS Hiscores.");
                return;
            }

            Canvas.registerFont("./runescape_uf.ttf", { family: "Runescape" });
            var canvas = Canvas.createCanvas(204, 275);
            var ctx = canvas.getContext('2d');
            ctx.font = '16px "Runescape"';
            ctx.fillStyle = 'rgb(255, 255, 0)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowColor = 'rgb(0, 0, 0)';

            ctx.drawImage(this.statsBg, 0, 0);

            var overallLevel = 0;
            Object.keys(player).forEach((key) => {
                if (key === "overall") return;

                var level = (key === "hitpoints") ? 10 : 1;

                var line: OsrsSkill = player[key];
                if (line) level = line.level;

                var offset = 0;
                if (level < 10) offset = 4;

                overallLevel += level;

                var posMap = positionMap[key];
                ctx.fillText(level.toLocaleString(), posMap[0] + offset, posMap[1]);
                ctx.fillText(level.toLocaleString(), posMap[0] + 13 + offset, posMap[1] + 13);
            });

            ctx.textAlign = "center";
            if (player.overall && player.overall.level) overallLevel = player.overall.level;

            ctx.fillText(overallLevel.toString(), 165, 258);

            var stream = canvas.createPNGStream();
            msg.channel.send(`Stats for ${Formatter.formatRSN(search)}:`, new Discord.Attachment(stream));
        });
    }
}