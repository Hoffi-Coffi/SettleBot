import {Logger} from '../utilities/logger';

import {singleton} from 'tsyringe';
import * as fs from 'fs';
import moment from 'moment';

const MOD = "statsHandler.ts";

interface IStat {
    name: Stat;
    count: number;
}

export enum Stat {
    MessagesSeen = "messagesseen",
    WordsScanned = "wordsscanned",
    BadWordsFound = "badwordsfound",
    DeletedMessages = "deletedmessages",
    MembersMutedAuto = "membersmutedauto",
    MembersMutedManual = "membersmutedmanual"
};

@singleton()
export class StatsHandler {
    private storedStats: IStat[] = [];
    private wokeUp: moment.Moment = moment();

    constructor(private logger: Logger) {
        this.loadStats();
    }

    private loadStats(): void {
        fs.readFile("./stats.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read stats: ${err}`, MOD);
                return;
            }
    
            var model = JSON.parse(data.toString());
    
            if (!model) {
                this.logger.warn("Couldn't find any stats data.", MOD);
                return;
            }
    
            model.forEach((obj: IStat) => this.storedStats.push(obj));
    
            this.logger.info("Stats loaded", MOD);
        });
    }

    getWokeUp(): moment.Moment {
        return this.wokeUp;
    }

    increment(stat: Stat): void {
        var findStat = this.storedStats.find((obj) => obj.name === stat);

        if (findStat) {
            this.storedStats.splice(this.storedStats.indexOf(findStat), 1);

            findStat.count = findStat.count + 1;
            this.storedStats.push(findStat);
        } else {
            this.storedStats.push({
                name: stat,
                count: 1
            });
        }
    }

    getStat(stat: Stat): number {
        var foundStat = this.storedStats.find((obj) => obj.name === stat);

        return (foundStat) ? foundStat.count : 0;
    }

    shutdown(callback: Function): void {
        this.logger.info("Saving stats...", MOD);
        fs.writeFile("./stats.json", JSON.stringify(this.storedStats), (err) => {
            if (err) this.logger.error(`Failed to update stats file: ${err}`, MOD);
            else callback();
        });
    }
};