import { injectable } from "tsyringe";
import { LeaderboardHandler } from "../handlers/leaderboardHandler";
import { Logger } from "../utilities/logger";
import Discord from "discord.js";
import { CommandType } from "../utilities/models";
import ServerUtils from "../utilities/serverUtils";
import TableBuilder, { Table } from "../utilities/tableBuilder";
import Guard from "../utilities/guard";

const MOD = "leaderboardService.ts";

@injectable()
export class LeaderboardService {
    constructor(private handler: LeaderboardHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("hns", (msg) => this.hnsLeaderboard(msg), CommandType.Public);
        registerCallback("hnsadd", (msg) => this.hnsIncrement(msg), CommandType.Public, (msg) => Guard.hasRole(msg, "Minigame Host"));
        registerCallback("hnsrem", (msg) => this.hnsDecrement(msg), CommandType.Public, (msg) => Guard.hasRole(msg, "Minigame Host"));

        this.logger.info("Registered 3 commands.", MOD);
    }

    private hnsLeaderboard(msg: Discord.Message): void {
        var leaderboard = this.handler.getLeaderboard("hns");

        if (!leaderboard) {
            msg.reply("there's no Hide-n-Seek leaderboard yet.");
            return;
        }

        var cells: string[][] = [];

        leaderboard.scores = leaderboard.scores.sort((a, b) => b.score - a.score);

        var searchFound = false;
        leaderboard.scores.forEach((row, idx) => {
            if (idx + 1 > 10) return;
            var newRow = [];

            var memb = ServerUtils.getDiscordMemberById(row.discordId);

            var membName = "Unknown User";
            if (memb) membName = memb.user.username;

            newRow.push(`${idx + 1}`);
            newRow.push(membName);
            newRow.push(row.score.toLocaleString());

            cells.push(newRow);

            if (msg.author.id === row.discordId) searchFound = true;
        });

        var reduce = 0;
        if (!searchFound) {
            // User isn't in the top-10.
            var found = leaderboard.scores.find((obj) => obj.discordId === msg.author.id);

            if (found) {
                var memb = ServerUtils.getDiscordMemberById(msg.author.id);

                if (memb) {
                    reduce++;

                    cells.push(["..", "..", ".."]);

                    var row = [
                        (leaderboard.scores.indexOf(found) + 1).toString(),
                        memb.user.username,
                        found.score.toLocaleString()
                    ];

                    cells.push(row);
                }
            }
        }

        var foot = undefined;
        if (leaderboard.scores.length > 10) {
            foot = [`...plus ${leaderboard.scores.length - 10 - reduce} more...`];
        }

        var table: Table = {
            header: ["Hide-n-Seek", "Leaderboard"],
            columns: ["Pos.", "Name", "Score"],
            rows: cells,
            footer: foot
        };

        var result = TableBuilder.build(table);

        msg.channel.send("```" + result + "```");
    }

    private hnsIncrement(msg: Discord.Message) {
        var mention = msg.mentions.users.first();

        if (!mention) {
            msg.reply("you have to tag the user who scored.");
            return;
        }

        var menId = mention.id;

        this.handler.incrementScore("hns", menId);

        msg.reply("done!");
    }

    private hnsDecrement(msg: Discord.Message) {
        var mention = msg.mentions.users.first();

        if (!mention) {
            msg.reply("you have to tag the user.");
            return;
        }

        var menId = mention.id;

        this.handler.decrementScore("hns", menId);

        msg.reply("done!");
    }
}