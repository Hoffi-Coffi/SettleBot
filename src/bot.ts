import 'reflect-metadata';
import './utilities/stringExtensions';

//#region Utilities / External
import * as Discord from 'discord.js';
import {Logger} from './utilities/logger';
import Guard from './utilities/guard';
import {container} from "tsyringe";

var logger = container.resolve(Logger);
//#endregion

//#region Auth
var authDev = require('./auth.dev.json');
var authProd = require('./auth.prod.json');
//#endregion

//#region Modules
import {CommandHandler} from "./handlers/commandHandler";
import {FilterService} from "./services/filterService";

var cmdHandler = container.resolve(CommandHandler);
var filterService = container.resolve(FilterService);
//#endregion

const MOD = "bot.js";

var cmdArgs = process.argv.slice(2);
Guard.setDevMode(cmdArgs[0] !== '--prod');

var bot = new Discord.Client();

bot.on('ready', () => {
    logger.info('Connected!', MOD);
    logger.info(`Logged in as: ${bot.user.tag}!`, MOD);

    if (Guard.isDevMode()) logger.info("Running in DEVELOPMENT mode!", MOD);
    else logger.info("Running in PRODUCTION mode!", MOD);

    var server = bot.guilds.first();
    logger.info(`Connected to server: ${server.name}`, MOD);

    // Ensure the bot doesn't connect to the live server in development mode.
    if (Guard.isDevMode() && server.name !== "D'win Hoffi Coffi") {
        logger.warn("Tried to run in dev mode on a live server. Quitting...", MOD);
        bot.destroy();
        return;
    }

    cmdHandler.startup();
    cmdHandler.setup(bot);
});

bot.on('message', msg => {
    // If it's the bot speaking, don't do anything else.
    if (msg.author.tag === bot.user.tag) return;

    // If it's in a DM, don't do anything else.
    if (msg.channel.type === 'dm') return;

    var commandHandled = false;

    // Attempt to find a command first and foremost.
    if (msg.content.substring(0, 1) === '&') {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        commandHandled = cmdHandler.trigger(cmd, msg, args);
    } 
    
    if (!commandHandled) {
        // If the author of the message is a moderator, ignore their message and don't
        // apply any rules or filtering to it.
        if (Guard.isMod(msg) || Guard.isSeniorMod(msg) || Guard.isAdmin(msg)) {
            return;
        }

        filterService.scan(msg);
    }
});

bot.on('error', err => {
    logger.error(err.message);
});

if (Guard.isDevMode()) bot.login(authDev.token);
else bot.login(authProd.token);