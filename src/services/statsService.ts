import { injectable } from "tsyringe";
import Discord from "discord.js";

import { CmlHandler } from "../handlers/cmlHandler";
import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import TableBuilder, { Table } from "../utilities/tableBuilder";
import { CommandType } from "../handlers/commandHandler";

const MOD = "statsService.ts";

@injectable()
export class StatsService {
    constructor(private cmlHandler: CmlHandler, 
        private memberHandler: MemberHandler, 
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
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

        this.cmlHandler.getStatsData(search, (data) => {
            if (!data) {
                msg.reply("I couldn't find that user on the CML hiscores. Try updating them first.");
                return;
            }

            var lines = data.split('\n');
            var cells: string[][] = [];
            lines.forEach((line) => {
                if (line.length > 1) {
                    var newRow = [];
                    var row = line.split(',');
                    newRow.push(row[0]);
                    newRow.push(parseInt(row[1]).toLocaleString());
                    newRow.push(parseInt(row[3]).toLocaleString());
                    newRow.push(parseInt(row[2]).toLocaleString());

                    cells.push(newRow);
                }
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