const logger = require('../utilities/logger');
const serverUtils = require('../utilities/serverUtils');
const guard = require('../utilities/guard');

const filterHandler = require('../handlers/filterHandler');
const statsHandler = require('../handlers/statsHandler');
const offenderHandler = require('../handlers/offenderHandler');

const adminService = require('./adminService');

const MOD = "filterService.js";

var filter = exports;

filter.startup = (registerCallback) => {
    registerCallback("addword", addWord, (msg) => guard.isSeniorMod(msg));
    registerCallback("rmword", removeWord, (msg) => guard.isSeniorMod(msg));

    logger.info("Registered 2 commands.", MOD);
}

filter.scan = (msg) => {
    statsHandler.increment("messagesSeen");
    var words = JSON.stringify(msg.content).split(' ');

    words.some(word => {
        statsHandler.increment("wordsScanned");
        var result = filterHandler.checkword(word);

        if (!result) return false;

        var memb = msg.guild.member(msg.author);

        switch (result) {
            case "delete":
                statsHandler.increment("badWordsFound");

                serverUtils.deleteMessage(msg, () => {
                    offenderHandler.add(msg.author.username);

                    var result = offenderHandler.check(msg.author.username);

                    if (result === "warn") {
                        serverUtils.directMessage(memb, `Hi ${memb}. You've had three messages deleted by me recently, for bad language. This message is just to let you know that the next time I need to delete your message, you'll also be muted.`);
                    } else if (result === "mute") {
                        serverUtils.setUserRoles(memb, [adminService.getMuteRole()], "Member reached 4 infractions.")
                            .then(() => {
                                serverUtils.messageChannel(adminService.getAuditChannel(), `${memb} was muted because they reached 4 infractions.`);
                                serverUtils.directMessage(memb, `Hi ${memb}, you were muted in the Settlement Discord server for bad language. To be unmuted, please DM a Settlement Defender or Admin.`);
                            })
                            .catch((err) => {
                                logger.warn(`Tried to mute ${memb} but couldn't. Reason: ${err}`, MOD);
                            });
                    }
                });
                return true;
            case "mute":
                statsHandler.increment("badWordsFound");

                serverUtils.deleteMessage(msg, () => {
                    offenderHandler.add(msg.author.username);

                    serverUtils.setUserRoles(memb, [adminService.getMuteRole()], "Member triggered the mutelist.")
                        .then(() => {
                            serverUtils.messageChannel(adminService.getAuditChannel(), `${memb} was muted because they triggered the mutelist.`);
                            serverUtils.directMessage(memb, `Hi ${memb}, you were muted in the Settlement Discord server for bad language. To be unmuted, please DM a Settlement Defender or Admin.`);
                        })
                        .catch((err) => {
                            logger.warn(`Tried to mute ${memb} but couldn't. Reason: ${err}`, MOD);
                        });
                });
                return true;
        }

        return false;
    });
}

function addWord(msg, args) {
    if (args.length < 2) {
        msg.reply("you must provide an action and a word. Usage: `&addword <action> <word>`. Current actions are `delete` or `mute`.");
        return;
    }

    var action = args[0];
    var word = args[1];

    filterHandler.addword(action, word);
    msg.reply("added!");
}

function removeWord(msg, args) {
    if (args.length < 2) {
        msg.reply("you must provide an action and a word. Usage: `&rmword <action> <word>`. Current actions are `delete` or `mute`.");
        return;
    }

    var action = args[0];
    var word = args[1];

    filterHandler.rmword(action, word);
    msg.reply("removed!");
}