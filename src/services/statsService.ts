import { injectable } from "tsyringe";
import Discord from "discord.js";

import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import TableBuilder, { Table } from "../utilities/tableBuilder";
import { CommandType, OsrsSkill } from "../utilities/models";
import { OsrsHandler } from "../handlers/osrsHandler";

const MOD = "statsService.ts";

@injectable()
export class StatsService {
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
        registerCallback("stats", (msg, args) => this.getPlayerStats(msg, args), CommandType.Public);

        this.logger.info("Registered 1 command.", MOD);
    }

    private getPlayerStats(msg: Discord.Message, args: string[]): void {
        var search: any;

        var player = this.memberHandler.get(msg.author.username);

        search = player;

        if (args && args.length > 0) search = args.join("_");

        if (search === player) {
            if (!player) {
                msg.reply("you need to register your RSN with me before you can use this command without providing an RSN. Try `&register <rsn>` first, or use `&stats <rsn>`.");
                return;
            }

            search = player.rsn;
        }

        this.osrsHandler.getPlayerStats(search, (player) => {
            if (!player) {
                msg.reply("I can't find that RSN on the OSRS Hiscores.");
                return;
            }

            var cells: string[][] = [];

            Object.keys(player).forEach((key) => {
                var newRow = [];

                var line: OsrsSkill = player[key];
                if (!line) return;

                newRow.push(key[0].toUpperCase() + key.substring(1));
                newRow.push(line.exp.toLocaleString());
                newRow.push(line.level.toLocaleString());
                newRow.push(line.rank.toLocaleString());

                cells.push(newRow);
            });

            var table: Table = {
                header: [`Stats for ${Formatter.formatRSN(search)}:`],
                columns: ["Skill", "Exp", "Level", "Rank"],
                rows: cells
            };

            var result = TableBuilder.build(table);

            msg.channel.send("```" + result + "```");
        });
    }
}