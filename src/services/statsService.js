const logger = require('../utilities/logger');
const guard = require('../utilities/guard');
const moment = require('moment');

var handler = require("../handlers/statsHandler");

const MOD = "statsService.js";
const wokeUp = moment();

var stats = exports;

stats.startup = (registerCallback) => {
    registerCallback("stats", printStats, (msg) => guard.isMod(msg));

    registerCallback("uptime", uptime, (msg) => guard.isMod(msg));

    logger.info("Registered 2 commands.", MOD);
}

function printStats(msg) {
    var messagesSeen = handler.getStat("messagesseen");
    var wordsScanned = handler.getStat("wordsscanned");
    var badWordsFound = handler.getStat("badwordsfound");
    var deletedMessages = handler.getStat("deletedmessages");
    var membersMutedAuto = handler.getStat("membersmutedauto");
    var membersMutedManual = handler.getStat("membersmutedmanual");

    var messagesWord = (messagesSeen === 1) ? "message" : "messages";
    var wordsScannedWord = (wordsScanned === 1) ? "word" : "words";
    var badWordsWord = (badWordsFound === 1) ? "word" : "words";
    var deletedMessagesWord = (deletedMessages === 1) ? "message" : "messages";
    var muteAutoWord = (membersMutedAuto === 1) ? "person" : "people";
    var muteManWord = (membersMutedManual === 1) ? "person" : "people";

    msg.reply(`I have seen ${messagesSeen.toLocaleString()} ${messagesWord} and scanned a total of ${wordsScanned.toLocaleString()} ${wordsScannedWord}! Of those, I've found ${badWordsFound.toLocaleString()} filtered ${badWordsWord}. I've deleted ${deletedMessages.toLocaleString()} ${deletedMessagesWord}. I've muted ${membersMutedAuto.toLocaleString()} ${muteAutoWord} automatically, and ${membersMutedManual.toLocaleString()} ${muteManWord} on behalf of moderators.`);
}

function uptime(msg) {
    msg.reply(`I woke up ${wokeUp.fromNow()}!`);
}