import { singleton } from "tsyringe";
import { Leaderboard } from "../utilities/models";
import { Logger } from "../utilities/logger";
import * as fs from "fs";

const MOD = "leaderboardHandler.ts";

@singleton()
export class LeaderboardHandler {
    private leaderboards: Leaderboard[];

    constructor(private logger: Logger) {
        this.loadLeaderboards();
    }

    loadLeaderboards(): void {
        this.leaderboards = [];

        fs.readFile("./leaderboards.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read leaderboards: ${err}`, MOD);
                return;
            }

            this.leaderboards = JSON.parse(data.toString());

            if (!this.leaderboards || this.leaderboards.length < 1) {
                this.logger.warn("Couldn't find any leaderboards.", MOD);
                return;
            }

            this.logger.info("Leaderboards loaded.", MOD);
        });
    }

    incrementScore(type: "hns" | "quiz", discordId: string): void {
        var leaderboard = this.leaderboards.find(lead => lead.type === type);

        if (!leaderboard) {
            leaderboard = {
                type: type,
                scores: []
            };

            leaderboard.scores.push({
                discordId: discordId,
                score: 1
            });

            this.leaderboards.push(leaderboard);
            this.saveLeaderboards();
            return;
        }

        var score = leaderboard.scores.find(score => score.discordId === discordId);
        this.leaderboards.splice(this.leaderboards.indexOf(leaderboard), 1);

        if (score) {
            leaderboard.scores.splice(leaderboard.scores.indexOf(score), 1);
            score.score = score.score + 1;

            leaderboard.scores.push(score);
        } else {
            leaderboard.scores.push({
                discordId: discordId,
                score: 1
            });
        }

        this.leaderboards.push(leaderboard);
        this.saveLeaderboards();
    }

    decrementScore(type: "hns" | "quiz", discordId: string): void {
        var leaderboard = this.leaderboards.find(lead => lead.type === type);

        if (!leaderboard) return;

        var score = leaderboard.scores.find(score => score.discordId === discordId);

        if (!score) return;

        this.leaderboards.splice(this.leaderboards.indexOf(leaderboard), 1);

        leaderboard.scores.splice(leaderboard.scores.indexOf(score), 1);
        score.score = score.score - 1;

        if (score.score > 0) leaderboard.scores.push(score);

        this.leaderboards.push(leaderboard);
        this.saveLeaderboards();
    }

    getLeaderboard(type: "hns" | "quiz"): Leaderboard {
        var leaderboard = this.leaderboards.find(lead => lead.type === type);

        return leaderboard;
    }

    private saveLeaderboards(): void {
        fs.writeFile("./leaderboards.json", JSON.stringify(this.leaderboards), (err) => {
            if (err) this.logger.error(`Failed to save leaderboards: ${err}`, MOD);
        });
    }
}