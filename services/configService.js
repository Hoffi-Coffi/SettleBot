const logger = require("../utilities/logger");
const guard = require("../utilities/guard");

const memberService = require("../services/memberService");
const cmlService = require("../services/cmlService");
const cmlHandler = require("../handlers/cmlHandler");
const configHandler = require("../handlers/configHandler");

const moment = require("moment");

const MOD = "configService.js";

var config = exports;

var sotwChannel = undefined;

config.startup = (registerCallback) => {
    registerCallback("setconfig", setConfig, (msg) => guard.isSeniorMod(msg) || guard.isToucann(msg));

    logger.info("Registered 1 command.", MOD);
}

config.setup = (_sotwChannel) => {
    sotwChannel = _sotwChannel;

    if (!sotwChannel) logger.warn("Couldn't find SOTW channel.", MOD);
}

config.updateSotw = (startDatetime, sotwCompId, msg) => {
    var startMillis = moment(startDatetime).valueOf();
    var nowMillis = moment().valueOf();

    var diff = (startMillis - nowMillis) + 30000;

    setTimeout(() => {
        configHandler.updateSetting("sotwCompId", sotwCompId, () => {
            cmlHandler.scrape(() => {
                memberService.getAthleteRole().setMentionable(true).then(() => {
                    sotwChannel.send(`${memberService.getAthleteRole()}, a new Skill Of The Week competition has begun!`)
                        .then(() => {
                            cmlService.sotw(msg, [], sotwChannel);
                            memberService.getAthleteRole().setMentionable(false);
                        });
                });
            }, sotwCompId);
        });
    }, diff);
}

function setConfig(msg, args) {
    if (args.length < 2) {
        msg.reply("you must provide a config name and value. Usage: `&setconfig <name> <value>`");
        return;
    }

    var callback = undefined;

    if (args[0].trim().toLowerCase() === 'sotwcompid') {
        callback = () => {
            cmlHandler.scrape(() => {
                memberService.getAthleteRole().setMentionable(true).then(() => {
                    sotwChannel.send(`${memberService.getAthleteRole()}, a new Skill Of The Week competition has begun!`)
                        .then(() => {
                            cmlService.sotw(msg, [], sotwChannel);
                            memberService.getAthleteRole().setMentionable(false);
                        });
                });
            });
        }
    }

    configHandler.updateSetting(args[0], args[1], callback);

    msg.reply("updated!");
}