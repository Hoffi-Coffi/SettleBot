import * as moment from "moment";

export enum Metric {
    MessagesSeen = "messagesseen",
    WordsScanned = "wordsscanned",
    BadWordsFound = "badwordsfound",
    DeletedMessages = "deletedmessages",
    MembersMutedAuto = "membersmutedauto",
    MembersMutedManual = "membersmutedmanual"
};

export class MetricHandler {
    getWokeUp(): moment.Moment {
        return moment();
    }

    getMetric(metric: Metric): number {
        return (metric === Metric.WordsScanned) ? 2 : 1;
    }
}