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
import {NotifyService} from "./services/notifyService";
import {EchoService} from "./services/echoService";
import { CommandType } from './utilities/models';
import ServerUtils from './utilities/serverUtils';
import { PollService } from './services/pollService';

var cmdHandler = container.resolve(CommandHandler);
var filterService = container.resolve(FilterService);
var echoService = container.resolve(EchoService);
var notifyService = container.resolve(NotifyService);
var pollService = container.resolve(PollService);
//#endregion

const MOD = "bot.ts";

var cmdArgs = process.argv.slice(2);
Guard.setDevMode(cmdArgs[0] !== '--prod');

var bot = new Discord.Client();

bot.on('ready', () => {
    logger.info('Connected!', MOD);
    logger.info(`Logged in as: ${bot.user.tag}!`, MOD);

    if (Guard.isDevMode()) logger.info("Running in DEVELOPMENT mode!", MOD);
    else logger.info("Running in PRODUCTION mode!", MOD);

    bot.guilds.forEach((serv) => {
        logger.info(`Connected to server: ${serv.name}`, MOD);
    });

    var server = bot.guilds.find((serv) => serv.name !== "D'win Hoffi Coffi");
    if (server === null) {
        logger.warn("Couldn't find a server other than the home server. Quitting...", MOD);
        bot.destroy();
        return;
    }

    Guard.setServer(server);
    ServerUtils.setServer(server);

    // Ensure the bot doesn't connect to the live server in development mode.
    if (Guard.isDevMode() && server.name !== "test") {
        logger.warn("Tried to run in dev mode on a live server. Quitting...", MOD);
        bot.destroy();
        return;
    }

    cmdHandler.startup();
    cmdHandler.setup(bot);

    echoService.setEchoChannel(server.channels.find(chan => chan.name === "mini-recs"));
});

bot.on('messageReactionAdd', (msgReact: Discord.MessageReaction, user: Discord.User) => {
    if (user.tag === bot.user.tag) return;

    if (notifyService.handleReactAdd(msgReact, user)) return;
    if (pollService.handleReactAdd(msgReact, user)) return;
});

bot.on('messageReactionRemove', (msgReact: Discord.MessageReaction, user: Discord.User) => {
    if (user.tag === bot.user.tag) return;

    if (notifyService.handleReactRemove(msgReact, user)) return;
});

bot.on('message', msg => {
    // If this happened in the home server, don't do anything else.
    if (msg.channel.type !== "dm" && msg.guild !== ServerUtils.getServer()) return;

    // If it's the bot speaking, don't do anything else.
    if (msg.author.tag === bot.user.tag) return;

    // if (echoService.handleMessage(msg)) return;

    // Memes
    if (msg.content === '73' || msg.content.indexOf(' 73') > -1 || msg.content.indexOf('boaty integer') > -1 || msg.content.indexOf("b0aty integer") > -1 || msg.content.indexOf('73 ') > -1 || msg.content.indexOf('613106980566859787') > -1) {
        msg.react('613106980566859787');
    }

    var commandHandled = false;

    // Attempt to find a command first and foremost.
    if (msg.content.substring(0, 1) === '!') {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0].toLowerCase();

        args = args.splice(1);

        var type = CommandType.Public;
        if (msg.channel.type === 'dm') type = CommandType.Private;

        commandHandled = cmdHandler.trigger(cmd, msg, args, type);
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