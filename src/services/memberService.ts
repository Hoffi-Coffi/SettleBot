import { singleton } from 'tsyringe';
import Discord from "discord.js";

import { MemberHandler } from '../handlers/memberHandler';
import { CmlHandler } from '../handlers/cmlHandler';

import { Logger } from '../utilities/logger';
import ServerUtils from '../utilities/serverUtils';
import Formatter from '../utilities/formatter';
import { CommandType } from '../handlers/commandHandler';
import Guard from '../utilities/guard';

const MOD = "memberService.ts";

@singleton()
export class MemberService {
    private athleteRole: Discord.Role;

    constructor(private memberHandler: MemberHandler, private cmlHandler: CmlHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string, action: (msg: Discord.Message, args?: string[]) => void, commandType: CommandType, preReq?: (msg: Discord.Message) => boolean) => void): void {
        registerCallback("register", (msg, args) => this.registerMember(msg, args), CommandType.Public);
        registerCallback("check", (msg) => this.checkMember(msg), CommandType.Public);
        registerCallback("whois", (msg, args) => this.whois(msg, args), CommandType.Private, (msg) => Guard.isAdminPriv(msg));

        this.logger.info("Registered 3 commands.", MOD);
    }

    setup(_athleteRole: Discord.Role): void {
        this.athleteRole = _athleteRole;

        if (!this.athleteRole) this.logger.warn("Couldn't find an Athlete role.", MOD);
    }

    getAthleteRole(): Discord.Role {
        return this.athleteRole;
    }

    private whois(msg: Discord.Message, args: string[]): void {
        if (args.length < 1) {
            msg.reply("you need to provide an RSN.");
            return;
        }

        var rsn = args.join("_");
        var res = this.memberHandler.getByRsn(rsn);

        if (res) {
            msg.reply(`"${rsn}" belongs to Discord user "${res.user}"!`);
            return;
        }

        msg.reply("I couldn't find that RSN.");
    }

    private registerMember(msg: Discord.Message, args: string[]): void {
        if (args.length < 1) {
            var existing = this.memberHandler.getById(msg.author.id);

            if (existing) {
                msg.reply(`you're registered with me with RSN \`${Formatter.formatRSN(existing.rsn)}\`!`);
                return;
            }

            msg.reply("you need to tell me your RSN. Try `&register <rsn>`!");
            return;
        }
    
        var rsn = args.join("_");
        // var reply = null;

        this.memberHandler.register(rsn, msg.author.username, msg.author.id);

        msg.reply(`I've set your RSN to "${Formatter.formatRSN(rsn)}"`);
    
        // var finalise = () => {
        //     this.memberHandler.register(rsn, msg.author.username);
    
        //     ServerUtils.addRoleToUser(msg.guild.member(msg.author), this.athleteRole);
    
        //     this.cmlHandler.updatePlayer(rsn, () => {
        //         reply.delete();
    
        //         msg.reply("I've added you to my memberlist.");
        //     });
        // }
    
        // msg.reply("just a second...")
        //     .then((_reply) => {
        //         reply = _reply;
        //         this.cmlHandler.getGroup((group) => {
        //             this.cmlHandler.getUserList(group, (playerList: string) => {
        //                 if (playerList && playerList.toLowerCase().indexOf(rsn.toLowerCase()) < 0) {
        //                     this.cmlHandler.addPlayer(rsn.toLowerCase(), group, finalise);
        //                 } else finalise();
        //             });
        //         });
        // });
    }

    private checkMember(msg: Discord.Message): void {
        var result = this.memberHandler.get(msg.author.username);

        if (!result) msg.reply("I don't have you on my memberlist.");
        else msg.reply(`you're on my memberlist with RSN "${Formatter.formatRSN(result.rsn)}"`);
    }
};