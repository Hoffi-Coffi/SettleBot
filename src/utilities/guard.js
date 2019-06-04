const Discord = require("discord.js");

var devMode = true;

var guard = exports;

guard.isMod = (msg) => {
    var memb = msg.guild.member(msg.author);

    return (memb && memb.hasPermission(Discord.Permissions.FLAGS.KICK_MEMBERS));
}

guard.isSeniorMod = (msg) => {
    var memb = msg.guild.member(msg.author);

    return (memb && memb.hasPermission(Discord.Permissions.FLAGS.MANAGE_MESSAGES));
}

guard.isAdmin = (msg) => {
    var memb = msg.guild.member(msg.author);

    return (memb && memb.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR));
}

guard.isBotOwner = (msg) => {
    return (msg.author.username === "Hoffi Coffi" && msg.author.tag === "HoffiCoffi#2536");
}

guard.isToucann = (msg) => {
    return (msg.author.username === "Toucann" && msg.author.tag === "Toucann#6889");
}

guard.isDevMode = () => devMode;

guard.setDevMode = (newDevMode) => devMode = newDevMode;