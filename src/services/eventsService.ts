import Discord from "discord.js";
import { injectable } from "tsyringe";

import { Logger } from "../utilities/logger";
import { CommandType } from "../handlers/commandHandler";
import { EventsHandler } from "../handlers/eventsHandler";

import moment from 'moment';
import TableBuilder, { Table } from "../utilities/tableBuilder";
import Formatter from "../utilities/formatter";
import Guard from "../utilities/guard";

const MOD = "eventsService.ts";

@injectable()
export class EventsService {
    constructor(private handler: EventsHandler, private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("events", (msg) => this.getEvents(msg), CommandType.Public);
        registerCallback("reloadevents", (msg) => this.reloadEvents(msg), CommandType.Private, (msg) => Guard.isBotOwner(msg));

        this.logger.info("Registered 2 commands.", MOD);
    }

    reloadEvents(msg: Discord.Message): void {
        this.handler.loadEvents((err) => {
            if (err) msg.reply(`Failed to reload events. Reason: ${err}`);
            else msg.reply("Reloaded events successfully.");
        });
    }

    getEvents(msg: Discord.Message): void {
        var events = this.handler.getEvents();

        if (!events || events.length < 1) {
            msg.reply("no events are currently scheduled!");
            return;
        }

        var cells: string[][] = [];
        events.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()).forEach((event) => {
            var newRow = [];

            var eventDate = moment(event.date);

            newRow.push(event.name);
            newRow.push(Formatter.humanizeDuration(moment.duration(eventDate.diff(moment()))));

            cells.push(newRow);
        });

        var table: Table = {
            header: ["Currently scheduled events:"],
            columns: ["Event", "Time until event"],
            rows: cells
        };

        var result = TableBuilder.build(table);

        msg.channel.send("```" + result + "```");
    }
}