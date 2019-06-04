import {Logger} from '../utilities/logger';

import {singleton} from 'tsyringe';
import * as fs from 'fs';
import * as moment from 'moment';

const MOD = "statsHandler.ts";

@singleton()
export class StatsHandler {
    private storedStats = []; //todo type up
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
    
            model.forEach((obj) => this.storedStats.push(obj));
    
            this.logger.info("Stats loaded", MOD);
        });
    }

    getWokeUp(): moment.Moment {
        return this.wokeUp;
    }

    increment(stat: string): void { //todo enum?
        stat = stat.toLowerCase();

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

    getStat(stat: string): number {
        stat = stat.toLowerCase();

        var foundStat = this.storedStats.find((obj) => obj.name.toLowerCase() === stat);

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