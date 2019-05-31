const logger = require('../utilities/logger');
const guard = require('../utilities/guard');
const serverUtils = require('../utilities/serverUtils');

const statsHandler = require('../handlers/statsHandler');
const memberHandler = require('../handlers/memberHandler');

const MOD = "adminService.js";

var destroyFunc = undefined;
var auditChannel = undefined;
var muteRole = undefined;

var admin = exports;

admin.startup = (registerCallback) => {
    registerCallback("logout", logout, (msg) => guard.isSeniorMod(msg));
    registerCallback("unmute", unmuteMember, (msg) => guard.isSeniorMod(msg));
    registerCallback("mute", muteMember, (msg) => guard.isMod(msg));

    logger.info("Registered 3 commands.", MOD);
}

admin.setup = (_destroyFunc, _auditChannel, _muteRole) => {
    destroyFunc = _destroyFunc;
    auditChannel = _auditChannel;
    muteRole = _muteRole;

    if (!muteRole) logger.warn("Couldn't find a Mute role. Members won't be automatically or manually muted.", MOD);
    if (!auditChannel) logger.warn("Couldn't find an audit channel. Notifications won't be posted.", MOD);
}

admin.getMuteRole = () => muteRole;

admin.getAuditChannel = () => auditChannel;

function logout(msg) {
    logger.info(`Initiating bot shutdown on behalf of ${msg.author.username}...`);
    
    if (!guard.isDevMode()) serverUtils.messageChannel(auditChannel, `Shutting down by request of ${msg.guild.member(msg.author)} :cry:`);

    statsHandler.shutdown(() => memberHandler.shutdown(() => destroyFunc()));
}

function muteMember(msg) {
    var memb = msg.guild.member(msg.author);

    var mention = msg.mentions.users.first();

    if (!mention) {
        msg.reply("you have to tag a user to mute.");
        return;
    }

    var mentionMemb = msg.guild.member(mention);

    if (memb.highestRole.comparePositionTo(mentionMemb.highestRole) <= 0) {
        msg.reply("you can only mute roles below yours.");
        return;
    }

    serverUtils.setUserRoles(mentionMemb, [muteRole], `Mute requested by ${msg.author.username}.`)
        .then(() => {
            serverUtils.messageChannel(auditChannel, `${memb} has just muted ${mentionMemb}`);
            serverUtils.directMessage(mentionMemb, `Hi ${mentionMemb}, you were muted in the Settlement Discord server. To be unmuted, please DM a Settlement Defender or Admin.`)
        });
}

function unmuteMember(msg) {
    var mention = msg.mentions.users.first();

    if (!mention) {
        msg.reply("you have to tag a user to unmute.");
        return;
    }

    var mentionMemb = msg.guild.member(mention);

    if (!mentionMemb.roles.some(role => role.name === muteRole.name)) {
        msg.reply("I can't unmute someone who isn't muted.");
        return;
    }

    serverUtils.removeRole(mentionMemb, muteRole, `Unmuted on behalf of ${msg.author.username}.`);
}