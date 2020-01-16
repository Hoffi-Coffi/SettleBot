import * as https from "https";

import { injectable } from "tsyringe";
import { Logger } from "../utilities/logger";
import { OsrsPlayer } from "../utilities/models";

const MOD = "osrsHandler.ts";

const baseURL = "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";

@injectable()
export class OsrsHandler {
    constructor(private logger: Logger) {}

    getPlayer(rsn: string, callback: (player: OsrsPlayer) => void): void {
        var url = baseURL + rsn;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                var player = this.parseData(data);

                if (!player) {
                    callback(null);
                    return;
                }

                callback(player);
            });
        });
    }

    private parseData(data: string): OsrsPlayer {
        if (data.indexOf('404 - Page not found') > -1) return null;

        if (data.length < 500) return null;

        var dataMap: string[][] = data.trim()
            .split('\n')
            .map((str): string[] => str.split(','));

        var player: OsrsPlayer = new OsrsPlayer();

        var skillKeys = Object.keys(player.skills);

        for (var i = 0; i < skillKeys.length; i++) {
            player.skills[skillKeys[i]] = {
                rank: parseInt(dataMap[i][0]),
                level: parseInt(dataMap[i][1]),
                exp: parseInt(dataMap[i][2])
            };
        }

        var idx = skillKeys.length + 1;
        var minigameKeys = Object.keys(player.minigames);

        for (var i = 0; i < 2; i++) {
            player.minigames[minigameKeys[i]] = {
                rank: parseInt(dataMap[idx + i][0]),
                score: parseInt(dataMap[idx + i][1])
            };
        }

        idx += 2;
        var cluesKeys = Object.keys(player.clues);

        for (var i = 0; i < cluesKeys.length; i++) {
            player.clues[cluesKeys[i]] = {
                rank: parseInt(dataMap[idx + i][0]),
                score: parseInt(dataMap[idx + i][1])
            };
        }

        idx += cluesKeys.length;

        player.minigames[minigameKeys[2]] = {
            rank: parseInt(dataMap[idx][0]),
            score: parseInt(dataMap[idx][1])
        };
        idx++;

        var bossKeys = Object.keys(player.bosses);

        for (var i = 0; i < bossKeys.length; i++) {
            if (!dataMap[idx + i]) continue;

            player.bosses[bossKeys[i]] = {
                rank: parseInt(dataMap[idx + i][0]),
                score: parseInt(dataMap[idx + i][1])
            };
        }

        return player;
    }
}