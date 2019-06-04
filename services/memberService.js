const logger = require('../utilities/logger');
const serverUtils = require('../utilities/serverUtils');
const formatter = require('../utilities/formatter');

const memberHandler = require('../handlers/memberHandler');
const cmlHandler = require('../handlers/cmlHandler');

const MOD = "memberService.js";

var athleteRole = undefined;

var member = exports;

member.startup = (registerCallback) => {
    registerCallback("register", registerMember);
    registerCallback("check", checkMember);

    logger.info("Registered 2 commands.", MOD);
}

member.setup = (_athleteRole) => {
    athleteRole = _athleteRole;

    if (!athleteRole) logger.warn("Couldn't find an Athlete role.", MOD);
}

member.getAthleteRole = () => athleteRole;

function registerMember(msg, args) {
    if (args.length < 1) {
        msg.reply("you need to tell me your RSN. Try `&register <rsn>`!");
        return;
    }

    var rsn = args.join("_");
    var reply = null;

    var finalise = () => {
        memberHandler.register(rsn, msg.author.username);

        serverUtils.addRoleToUser(msg.guild.member(msg.author), athleteRole);

        cmlHandler.updatePlayer(rsn, () => {
            reply.delete();

            msg.reply("I've added you to my memberlist.");
        });
    }

    msg.reply("just a second...")
        .then((_reply) => {
            reply = _reply;
            cmlHandler.getGroup((group) => {
                cmlHandler.getUserList(group, (playerList) => {
                    if (playerList && !playerList.toLowerCase().indexOf(rsn.toLowerCase()) > -1) {
                        cmlHandler.addPlayer(rsn.toLowerCase(), group, finalise);
                    } else finalise();
                });
            });
    });
}

function checkMember(msg) {
    var result = memberHandler.get(msg.author.username);

    if (!result) msg.reply("I don't have you on my memberlist.");
    else msg.reply(`you're on my memberlist with RSN "${formatter.formatRSN(result.rsn)}"`);
}