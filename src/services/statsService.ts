import {Logger} from '../utilities/logger';
import Guard from '../utilities/guard';

import {StatsHandler, Stat} from '../handlers/statsHandler';

import { injectable } from 'tsyringe';
import Discord from 'discord.js';

const MOD = "statsService.ts";

@injectable()
export class StatsService {
    constructor(private handler: StatsHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("stats", (msg) => this.printStats(msg), (msg) => Guard.isMod(msg));
        registerCallback("uptime", (msg) => this.uptime(msg), (msg) => Guard.isMod(msg));

        this.logger.info("Registered 2 commands.", MOD);
    }

    private printStats(msg: Discord.Message): void {
        var messagesSeen = this.handler.getStat(Stat.MessagesSeen);
        var wordsScanned = this.handler.getStat(Stat.WordsScanned);
        var badWordsFound = this.handler.getStat(Stat.BadWordsFound);
        var deletedMessages = this.handler.getStat(Stat.DeletedMessages);
        var membersMutedAuto = this.handler.getStat(Stat.MembersMutedAuto);
        var membersMutedManual = this.handler.getStat(Stat.MembersMutedManual);

        var messagesWord = (messagesSeen === 1) ? "message" : "messages";
        var wordsScannedWord = (wordsScanned === 1) ? "word" : "words";
        var badWordsWord = (badWordsFound === 1) ? "word" : "words";
        var deletedMessagesWord = (deletedMessages === 1) ? "message" : "messages";
        var muteAutoWord = (membersMutedAuto === 1) ? "person" : "people";
        var muteManWord = (membersMutedManual === 1) ? "person" : "people";

        msg.reply(`I have seen ${messagesSeen.toLocaleString()} ${messagesWord} and scanned a total of ${wordsScanned.toLocaleString()} ${wordsScannedWord}! Of those, I've found ${badWordsFound.toLocaleString()} filtered ${badWordsWord}. I've deleted ${deletedMessages.toLocaleString()} ${deletedMessagesWord}. I've muted ${membersMutedAuto.toLocaleString()} ${muteAutoWord} automatically, and ${membersMutedManual.toLocaleString()} ${muteManWord} on behalf of moderators.`);
    }

    private uptime(msg: Discord.Message): void {
        msg.reply(`I woke up ${this.handler.getWokeUp().fromNow()}!`);
    }
};