import { injectable } from "tsyringe";
import Discord from "discord.js";

import { CmlHandler } from "../handlers/cmlHandler";
import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import TableBuilder, { Table } from "../utilities/tableBuilder";

const MOD = "statsService.ts";

@injectable()
export class StatsService {
    constructor(private cmlHandler: CmlHandler, 
        private memberHandler: MemberHandler, 
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("stats", (msg, args) => this.getPlayerStats(msg, args));

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
                if (line.length > 1) cells.push(line.split(','));
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