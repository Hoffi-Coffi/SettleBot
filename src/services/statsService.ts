import { injectable } from "tsyringe";
import Discord from "discord.js";

import { CmlHandler } from "../handlers/cmlHandler";
import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import { ENGINE_METHOD_ALL } from "constants";

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
                msg.reply("you need to register you RSN with me before you can use this command without providing an RSN. Try `$register <rsn>` first, or use `&stats <rsn>`.");
                return;
            }

            search = player.rsn;
        }

        this.cmlHandler.getStatsData(search, (data) => {
            if (!data) {
                msg.reply("I couldn't find that user on the hiscores.");
                return;
            }
            
            var longestSkillName = 12, longestExp = 3, longestRank = 4, longestLevel = 5;

            var lines = data.split('\n');

            lines.forEach((obj) => {
                if (obj.length < 1) return;
                var line = obj.split(',');

                var exp = parseInt(line[1].trim()).toLocaleString();
                if (exp.length > longestExp) longestExp = exp.length;
                var rank = parseInt(line[2].trim()).toLocaleString();
                if (rank.length > longestRank) longestRank = rank.length;
            });

            var sepLine = "┌─";
            sepLine = `${sepLine.pad(longestSkillName, "─")}─┬─`;
            sepLine = `${sepLine.pad(longestExp, "─")}─┬─`;
            sepLine = `${sepLine.pad(longestLevel, "─")}─┬─`;
            sepLine = `${sepLine.pad(longestRank, "─")}─┐`;

            var textLine = `Stats for ${Formatter.formatRSN(search)}:`;
            var padEnd = sepLine.length - 4 - textLine.length;
            var result = `${sepLine.split('┬').join("─")}\n│ ${textLine}`;
            result = `${result.pad(padEnd, " ")} │\n`;

            sepLine = sepLine.replace("┌", "├").replace("┐", "┤");
            result += `${sepLine}\n│ Skill`;

            padEnd = longestSkillName - 5;
            result = `${result.pad(padEnd, " ")} │ Exp`;

            padEnd = longestExp - 3;
            result = `${result.pad(padEnd, " ")} │ Level`;

            padEnd = longestLevel - 5;
            result = `${result.pad(padEnd, " ")} │ Rank`;

            sepLine = sepLine.split("┬").join("┼");
            padEnd = longestRank - 4;
            result = `${result.pad(padEnd, " ")} │\n${sepLine}`;

            lines.forEach((obj) => {
                if (obj.length < 1) return;
                var line = obj.split(',');

                var skill = line[0].trim();

                result += `\n│ ${skill}`;

                padEnd = longestSkillName - skill.length;
                var exp = parseInt(line[1].trim()).toLocaleString();
                result = `${result.pad(padEnd, " ")} │ ${exp}`;

                padEnd = longestExp - exp.length;
                var level = parseInt(line[3].trim()).toLocaleString();
                result = `${result.pad(padEnd, " ")} │ ${level}`;

                padEnd = longestLevel - level.length;
                var rank = parseInt(line[2].trim()).toLocaleString();
                result = `${result.pad(padEnd, " ")} │ ${rank}`;

                padEnd = longestRank - rank.length;
                result = `${result.pad(padEnd, " ")} │`;
            });

            sepLine = sepLine.replace("├", "└").split("┼").join("┴").replace("┤", "┘");
            result += `\n${sepLine}`;

            msg.channel.send("```" + result + "```");
        });
    }
}