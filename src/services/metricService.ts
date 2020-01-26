import {Logger} from '../utilities/logger';
import Guard from '../utilities/guard';

import {MetricHandler} from '../handlers/metricHandler';

import { injectable } from 'tsyringe';
import Discord from 'discord.js';
import { CommandType, Metric } from '../utilities/models';

const MOD = "metricService.ts";

@injectable()
export class MetricService {
    constructor(private handler: MetricHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string[], 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback(["metrics"], () => this.getMetrics(), CommandType.Public, (msg) => Guard.isMod(msg));
        registerCallback(["uptime"], () => this.uptime(), CommandType.Public, (msg) => Guard.isMod(msg));

        this.logger.info("Registered 2 commands.", MOD);
    }

    getMetrics(): string {
        var messagesSeen = this.handler.getMetric(Metric.MessagesSeen);
        var wordsScanned = this.handler.getMetric(Metric.WordsScanned);
        var badWordsFound = this.handler.getMetric(Metric.BadWordsFound);
        var deletedMessages = this.handler.getMetric(Metric.DeletedMessages);
        var membersMutedAuto = this.handler.getMetric(Metric.MembersMutedAuto);
        var membersMutedManual = this.handler.getMetric(Metric.MembersMutedManual);

        var messagesWord = (messagesSeen === 1) ? "message" : "messages";
        var wordsScannedWord = (wordsScanned === 1) ? "word" : "words";
        var badWordsWord = (badWordsFound === 1) ? "word" : "words";
        var deletedMessagesWord = (deletedMessages === 1) ? "message" : "messages";
        var muteAutoWord = (membersMutedAuto === 1) ? "person" : "people";
        var muteManWord = (membersMutedManual === 1) ? "person" : "people";

        return `I have seen ${messagesSeen.toLocaleString()} ${messagesWord} and scanned a total of ${wordsScanned.toLocaleString()} ${wordsScannedWord}! Of those, I've found ${badWordsFound.toLocaleString()} filtered ${badWordsWord}. I've deleted ${deletedMessages.toLocaleString()} ${deletedMessagesWord}. I've muted ${membersMutedAuto.toLocaleString()} ${muteAutoWord} automatically, and ${membersMutedManual.toLocaleString()} ${muteManWord} on behalf of moderators.`;
    }

    uptime(): string {
        return `I woke up ${this.handler.getWokeUp().fromNow()}!`;
    }
};