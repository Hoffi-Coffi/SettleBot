import {Logger} from '../utilities/logger';

import {singleton} from 'tsyringe';
import * as fs from 'fs';
import moment from 'moment';

const MOD = "metricHandler.ts";

export interface IMetric {
    name: Metric;
    count: number;
}

export enum Metric {
    MessagesSeen = "messagesseen",
    WordsScanned = "wordsscanned",
    BadWordsFound = "badwordsfound",
    DeletedMessages = "deletedmessages",
    MembersMutedAuto = "membersmutedauto",
    MembersMutedManual = "membersmutedmanual"
};

@singleton()
export class MetricHandler {
    private storedMetrics: IMetric[] = [];
    private wokeUp: moment.Moment = moment();

    constructor(private logger: Logger) {
        this.loadMetrics();
    }

    private loadMetrics(): void {
        fs.readFile("./stats.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read metrics: ${err}`, MOD);
                return;
            }
    
            var model = JSON.parse(data.toString());
    
            if (!model) {
                this.logger.warn("Couldn't find any metric data.", MOD);
                return;
            }
    
            model.forEach((obj: IMetric) => this.storedMetrics.push(obj));
    
            this.logger.info("Metrics loaded", MOD);
        });
    }

    getWokeUp(): moment.Moment {
        return this.wokeUp;
    }

    increment(metric: Metric): void {
        var findStat = this.storedMetrics.find((obj) => obj.name === metric);

        if (findStat) {
            this.storedMetrics.splice(this.storedMetrics.indexOf(findStat), 1);

            findStat.count = findStat.count + 1;
            this.storedMetrics.push(findStat);
        } else {
            this.storedMetrics.push({
                name: metric,
                count: 1
            });
        }
    }

    getMetric(metric: Metric): number {
        var foundMetric = this.storedMetrics.find((obj) => obj.name === metric);

        return (foundMetric) ? foundMetric.count : 0;
    }

    shutdown(callback: Function): void {
        this.logger.info("Saving metrics...", MOD);
        fs.writeFile("./stats.json", JSON.stringify(this.storedMetrics), (err) => {
            if (err) this.logger.error(`Failed to update metrics file: ${err}`, MOD);
            else callback();
        });
    }
};