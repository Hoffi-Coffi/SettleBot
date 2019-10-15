import * as https from "https";

import { injectable } from "tsyringe";
import { Logger } from "../utilities/logger";
import { OsrsPlayer, OsrsSkill } from "../utilities/models";

const MOD = "osrsHandler.ts";

const baseURL = "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";

@injectable()
export class OsrsHandler {
    constructor(private logger: Logger) {}

    getPlayerStats(rsn: string, callback: (player: OsrsPlayer) => void): void {
        var url = baseURL + rsn;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                var skills = this.parseSkills(data);

                if (!skills) {
                    callback(null);
                    return;
                }

                var player: OsrsPlayer = {
                    overall: skills[0],
                    attack: skills[1],
                    defence: skills[2],
                    strength: skills[3],
                    hitpoints: skills[4],
                    ranged: skills[5],
                    prayer: skills[6],
                    magic: skills[7],
                    cooking: skills[8],
                    woodcutting: skills[9],
                    fletching: skills[10],
                    fishing: skills[11],
                    firemaking: skills[12],
                    crafting: skills[13],
                    smithing: skills[14],
                    mining: skills[15],
                    herblore: skills[16],
                    agility: skills[17],
                    thieving: skills[18],
                    slayer: skills[19],
                    farming: skills[20],
                    runecraft: skills[21],
                    hunter: skills[22],
                    construction: skills[23]
                };

                callback(player);
            });
        });
    }

    private parseSkills(data: string): OsrsSkill[] {
        if (data.indexOf('404 - Page not found') > -1) {
            return null;
        }

        var skills: OsrsSkill[] = [];

        var allSkills = data.split('\n');
        allSkills.forEach((skill) => {
            var skillSplit = skill.split(',');
            if (skillSplit.length < 3) return; // skills entries have three fields

            var rank = parseInt(skillSplit[0]);

            if (rank < 1) {
                skills.push(null);
                return;
            }

            skills.push({
                rank: rank,
                level: parseInt(skillSplit[1]),
                exp: parseInt(skillSplit[2])
            });
        });

        return skills;
    }
}