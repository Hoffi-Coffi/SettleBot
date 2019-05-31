const logger = require('../utilities/logger');

const statsService = require("../services/statsService");
const adminService = require("../services/adminService");
const memberService = require("../services/memberService");
const filterService = require("../services/filterService");
const cmlService = require("../services/cmlService");
const configService = require("../services/configService");

const MOD = "commandHandler.js";

var command = exports;

var commandDefinitions = [];

function registerCommand(trigger, func, preReq) {
    var existingCommand = commandDefinitions.find((cmd) => cmd.trigger === trigger);

    if (existingCommand) {
        logger.error(`Attempted to register a command for trigger "${trigger}" but one already exists!`, MOD);
        return;
    }

    commandDefinitions.push({
        trigger: trigger,
        func: func,
        preReq: preReq
    });
}

command.startup = () => {
    statsService.startup(registerCommand);
    adminService.startup(registerCommand);
    memberService.startup(registerCommand);
    filterService.startup(registerCommand);
    cmlService.startup(registerCommand);
    configService.startup(registerCommand);

    logger.info(`Command registration complete. Total commands: ${commandDefinitions.length}`, MOD);
}

command.setup = (bot) => {
    var server = bot.guilds.first();

    adminService.setup(() => {
            logger.info("Destroying bot...", MOD);
            bot.destroy().then(() => {
                process.exit();
            })
            .catch((err) => {
                logger.error(`Failed to destroy bot: ${err}`);
                process.exit(1);
            });
        }, 
        server.channels.find((channel) => channel.name === 'bot-log'),
        server.roles.find((role) => role.name === "Muted"));
    memberService.setup(server.roles.find((role) => role.name === 'Athlete'));
    configService.setup(server.channels.find((channel) => channel.name === "settlement_athletes"));
}

command.trigger = (trigger, msg, args) => {
    logger.info(`Attempting to find handler for command "${trigger}"...`, MOD);
    var foundCommand = commandDefinitions.find((cmd) => cmd.trigger === trigger);

    if (!foundCommand) {
        logger.info("Command not found.", MOD);
        return false;
    }

    logger.info("Command found! Executing...", MOD);

    var preReqPassed = (!foundCommand.preReq);
    if (!preReqPassed) preReqPassed = foundCommand.preReq(msg);

    if (preReqPassed) foundCommand.func(msg, args);

    return true;
}