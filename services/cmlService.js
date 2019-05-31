const logger = require("../utilities/logger");
const guard = require("../utilities/guard");
const formatter = require("../utilities/formatter");

const moment = require("moment");

const cmlHandler = require("../handlers/cmlHandler");
const memberHandler = require("../handlers/memberHandler");

const configService = require("./configService");

const MOD = "cmlService.js";

const skillMap = [
    {skill: "attack", match: ["att", "atk", "attack"]}, {skill: "strength", match: ["str", "strength", "stren"]}, {skill: "defence", match: ["def", "defence", "defense"]},
    {skill: "ranged", match: ["range", "ranged", "ranging"]}, {skill: "prayer", match: ["pray", "prayer"]}, {skill: "magic", match: ["mage", "magic"]},
    {skill: "runecrafting", match: ["rc", "runecraft", "runecrafting"]}, {skill: "hitpoints", match: ["hp", "hitpoints", "hitpoint"]}, {skill: "crafting", match: ["craft", "crafting"]},
    {skill: "mining", match: ["mine", "mining", "mineing"]}, {skill: "smithing", match: ["smith", "smithing"]}, {skill: "fishing", match: ["fish", "fishing"]},
    {skill: "cooking", match: ["cook", "cooking"]}, {skill: "firemaking", match: ["fm", "fming", "firemake", "firemaking"]},
    {skill: "woodcutting", match: ["wc", "wcing", "woodcut", "woodcutting"]}, {skill: "agility", match: ["agi", "agil", "agility"]}, {skill: "herblore", match: ["herb", "herblore"]},
    {skill: "thieving", match: ["thieve", "thieving", "theive", "theiving"]}, {skill: "fletching", match: ["fletch", "fletching"]}, {skill: "slayer", match: ["slay", "slayer"]},
    {skill: "farming", match: ["farm", "farming"]}, {skill: "construction", match: ["con", "cons", "construct", "construction"]}, {skill: "hunter", match: ["hunt", "hunter"]}
];

var cml = exports;

cml.startup = (registerCallback) => {
    registerCallback("update", updatePlayer);
    registerCallback("sotw", skillOfTheWeek);
    registerCallback("sotwlink", link);
    registerCallback("newcomp", stageNewSotw, (msg) => guard.isSeniorMod(msg) || guard.isToucann(msg));
    registerCallback("abandon", abandonSotw, (msg) => guard.isSeniorMod(msg) || guard.isToucann(msg));
    registerCallback("confirm", confirmSotw, (msg) => guard.isSeniorMod(msg) || guard.isToucann(msg));

    logger.info("Registered 6 commands.", MOD);
}

function updatePlayer(msg, args) {
    var search = "";

    var getRSN = memberHandler.get(msg.author.username);

    search = getRSN;

    if (guard.isSeniorMod(msg) || guard.isToucann(msg)) {
        if (args && args.length > 0) {
            search = args.join("_");
        }
    }

    if (search === getRSN) {
        if (!getRSN) {
            msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>` first.");
            return;
        }

        search = getRSN.rsn;
    }

    msg.reply("just a second whilst CML updates...")
        .then((reply) => {
            cmlHandler.updatePlayer(search, (content) => {
                reply.delete();

                if (content.indexOf('just updated less than') > -1) msg.reply("it's been less than 60 seconds since you were updated. Please wait a minute, and try again.");
                else msg.reply(`updated RSN "${formatter.formatRSN(search)}" successfully.`);
            });
        });
}

function skillOfTheWeek(msg, args) {
    cml.sotw(msg, args, msg.channel);
}

cml.sotw = (msg, args, chan) => {
    var search = "";
    if (args) {
        if (args.length < 1) {
            var getRSN = memberHandler.get(msg.author.username);

            if (getRSN) {
                search = getRSN.rsn;
            }
        } else {
            search = args.join("_");
        }
    }

    cmlHandler.sotw((res) => {
        chan.send(res);
    }, 5, search);
}

function link(msg) {
    msg.reply(cmlHandler.sotwlink());
}

function stageNewSotw(msg, args) {
    var mappedSkill = skillMap.find((obj) => obj.match.indexOf(args[0].toLowerCase()) > -1);

    if (!mappedSkill) {
        msg.reply("I couldn't figure out which skill you meant. Please try again.");
        return;
    }

    var skill = mappedSkill.skill;

    logger.info("Getting group...");
    cmlHandler.getGroup((group, cmlErr) => {
        if (!group && cmlErr) {
            msg.reply(`CML says: "${cmlErr}"`);
            return;
        }

        logger.info(`Found group ${group}. Getting userlist...`);
        cmlHandler.getUserList(group, (playerList, cmlErr) => {
            if (!playerList && cmlErr) {
                msg.reply(`CML had this to say: "${cmlErr}"`);
                return;
            }

            logger.info("Found user list. Staging data...");
            cmlHandler.stageData(skill, (data) => {
                var reply = "you're about to create a new SOTW with the following details:\n\n";
                reply += `Competition Name: ${data.find((obj) => obj.name === "title").value}\n`;
                reply += `Competition Start: Today at ${data.find((obj) => obj.name === "start_time").value} GMT\n`;
                reply += `Competition End: ${moment(data.find((obj) => obj.name === "end_date").value).format('Do [of] MMMM')} at ${data.find((obj) => obj.name === "end_time").value} GMT\n`;
                reply += `Skill: ${skill[0].toUpperCase() + skill.substring(1)}\n`;
                reply += `Players: ${data.find((obj) => obj.name === "players").value.split('\n').length - 1}\n\n`;
                reply += "Do you wish to proceed? Use `&confirm` or `&abandon`.";

                msg.reply(reply);
            });
        });
    });
}

function abandonSotw(msg) {
    cmlHandler.abandonComp((content) => msg.reply(content));
}

function confirmSotw(msg) {
    cmlHandler.createNewComp((compId, data) => {
        var datetime = `${data.find((obj) => obj.name === "start_date").value}T${data.find((obj) => obj.name === "start_time").value}Z`;

        configService.updateSotw(datetime, compId, msg);

        msg.reply("competition set-up successfully. I'll ping the Athletes when the competition begins.");
    })
}