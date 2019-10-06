import Discord from "discord.js";

import { injectable } from "tsyringe";
import { Logger } from "../utilities/logger";

const MOD = "echoService.ts";

@injectable()
export class EchoService {
    private echoChannel: Discord.TextChannel;

    constructor(private logger: Logger) {}

    handleMessage(msg: Discord.Message): boolean {
        var chan = <Discord.TextChannel>msg.channel;

        if (!chan) return false;
        if (chan.name !== "minigame-recommendations") return false;

        if (this.echoChannel) {
            this.echoChannel.send(`${msg.author} said: "${msg.content}"`);
            msg.delete();
        }

        return true;
    }

    setEchoChannel(chan: Discord.GuildChannel): void {
        this.echoChannel = <Discord.TextChannel>chan;
    }
}