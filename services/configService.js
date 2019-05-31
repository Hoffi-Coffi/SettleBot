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

var skillTopicMap = [
    {skill: "Attack", topic: "hit thing :crossed_swords:"}, {skill: "Strength", topic: "STRONK :muscle:"}, {skill: "Defence", topic: "not be hit :shield:"},
    {skill: "Ranged", topic: "yeeting :bow_and_arrow:"}, {skill: "Prayer", topic: "bothering deities :pray:"}, {skill: "Magic", topic: "splashing"},
    {skill: "Runecrafting", topic: "make magic rocks"}, {skill: "Hitpoints", topic: "livin' :heart:"}, {skill: "Crafting", topic: "make thing :tools:"},
    {skill: "Mining", topic: "hit rock :pick:"}, {skill: "Smithing", topic: "armour make :hammer:"}, {skill: "Fishing", topic: "obtain swimmers :fish:"},
    {skill: "Cooking", topic: "food"}, {skill: "Firemaking", topic: "burn stuff"}, {skill: "Woodcutting", topic: "chop wood :deciduous_tree: :evergreen_tree:"},
    {skill: "Agility", topic: "gotta go fast"}, {skill: "Herblore", topic: "uim's worst nightmare"}, {skill: "Thieving", topic: "illegal activities"},
    {skill: "Fletching", topic: "make stuff to yeet"}, {skill: "Slayer", topic: "kill specific stuff"}, {skill: "Farming", topic: "grow stuff"},
    {skill: "Construction", topic: "build stuff"}, {skill: "Hunter", topic: "catch animal"}
];

config.startup = (registerCallback) => {
    registerCallback("setconfig", setConfig, (msg) => guard.isSeniorMod(msg) || guard.isToucann(msg));

    logger.info("Registered 1 command.", MOD);
}

config.setup = (_sotwChannel) => {
    sotwChannel = _sotwChannel;

    setupTimeouts();

    if (!sotwChannel) logger.warn("Couldn't find SOTW channel.", MOD);
}

config.getSotwChannel = () => sotwChannel;

config.updateSotw = (startDatetime, sotwCompId, msg) => {
    var startMillis = moment(startDatetime).valueOf();
    var nowMillis = moment().valueOf();

    var diff = (startMillis - nowMillis) + 30000;

    setTimeout(() => {
        configHandler.updateSetting("sotwCompId", sotwCompId, () => {
            cmlHandler.scrape(() => {
                updateTopic();
                setupTimeouts();

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

function updateTopic() {
    var skill = configHandler.getSetting("sotwskill");

    var mappedTopic = skillTopicMap.find((obj) => obj.skill === skill).topic;

    if (!mappedTopic) mappedTopic = skill;

    sotwChannel.setTopic(`this week we are training ${mappedTopic}`);
}

function setupTimeouts() {
    var endMillis = moment(configHandler.getSetting("sotwend")).valueOf();
    var nowMillis = moment().valueOf();
    var diff = endMillis - nowMillis;

    if (diff < 0) return;

    var warnTime = (diff - (60000 * 30));

    if (warnTime > 0) {
        logger.info(`Setting a warning timeout for ${Math.ceil((warnTime / 1000) / 60)} minutes from now...`, MOD);
        setTimeout(() => {
            memberService.getAthleteRole().setMentionable(true).then(() => {
                sotwChannel.send(`${memberService.getAthleteRole()}, the competition ends in 30 minutes! Remember to logout of OSRS and use the \`&update\` command before the competition ends.`)
                    .then(() => {
                        memberService.getAthleteRole().setMentionable(false);
                    });
            });
        }, (diff - (60000 * 30)));
    }

    logger.info(`Setting an ending timeout for ${Math.ceil(((diff + 30000) / 1000) / 60)} minutes from now...`, MOD);
    setTimeout(() => {
        memberService.getAthleteRole().setMentionable(true).then(() => {
            sotwChannel.send(`${memberService.getAthleteRole()}, the competition has ended! Let's take a look at the final results...`)
                .then(() => {
                    cmlService.sotw(null, [], sotwChannel);
                    memberService.getAthleteRole().setMentionable(false);
                });
        });
    }, (diff + 30000));
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
                updateTopic();
                setupTimeouts();
                
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