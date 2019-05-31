const logger = require('./logger');

const MOD = "serverUtils.js";

var serverUtils = exports;

serverUtils.addRoleToUser = (memb, role) => {
    memb.addRole(role)
        .catch(err => {
            logger.error(`Failed to add ${role.name} role to ${memb}. Error: ${err}`, MOD);
        });
}

serverUtils.setUserRoles = (memb, roles, reason) => {
    return memb.setRoles(roles, reason);
}

serverUtils.removeRole = (memb, role, reason) => {
    memb.removeRole(role, reason);
}

serverUtils.messageChannel = (channel, message) => {
    channel.send(message)
        .catch(err => {
            logger.warn(`Couldn't send message to ${channel.name}. Error: ${err}`, MOD);
        });
}

serverUtils.directMessage = (memb, message) => {
    memb.createDM()
        .then(chan => {
            chan.send(`${message}\n\nI am a bot, and this action was performed automatically. DM replies are not monitored.`);
        })
        .catch(err => {
            logger.warn(`Couldn't DM ${memb}. Error: ${err}`, MOD);
        })
}

serverUtils.deleteMessage = (msg, callback) => {
    msg.delete()
        .then(() => {
            if (callback) callback();
        })
        .catch((err) => {
            logger.warn(`Failed to delete message. Error: ${err}`, MOD);
        });
}