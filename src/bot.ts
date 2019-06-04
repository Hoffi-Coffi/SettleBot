//#region Utilities / External
import Discord from 'discord.js';
import Logger from './utilities/logger';
const guard = require('./utilities/guard');
//#endregion

//#region Auth
const authDev = require('./auth.dev.json');
const authProd = require('./auth.prod.json');
//#endregion

//#region Modules
var cmdHandler = require('./handlers/commandHandler');
var filterService = require('./services/filterService');
//#endregion

//#region Extension Methods
Object.defineProperty(String.prototype, "pad", {
    value: function pad(padLength, sep) {
        var res = this;
        for (var x = 0; x < padLength; x++) res += sep;

        return res;
    },
    writable: true,
    configurable: true
});
//#endregion

const MOD = "bot.js";

var cmdArgs = process.argv.slice(2);
guard.setDevMode(cmdArgs[0] !== '--prod');

var bot = new Discord.Client();

bot.on('ready', () => {
    Logger.info('Connected!', MOD);
    Logger.info(`Logged in as: ${bot.user.tag}!`, MOD);

    if (guard.isDevMode()) Logger.info("Running in DEVELOPMENT mode!", MOD);
    else Logger.info("Running in PRODUCTION mode!", MOD);

    var server = bot.guilds.first();
    Logger.info(`Connected to server: ${server.name}`, MOD);

    // Ensure the bot doesn't connect to the live server in development mode.
    if (guard.isDevMode() && server.name !== "D'win Hoffi Coffi") {
        Logger.warn("Tried to run in dev mode on a live server. Quitting...", MOD);
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
        if (guard.isMod(msg) || guard.isSeniorMod(msg) || guard.isAdmin(msg)) {
            return;
        }

        filterService.scan(msg);
    }
});

bot.on('error', err => {
    Logger.error(err.message);
});

if (guard.isDevMode()) bot.login(authDev.token);
else bot.login(authProd.token);