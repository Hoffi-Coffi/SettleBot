import { singleton } from "tsyringe";
import { Logger } from "../utilities/logger";
import * as fs from "fs";
import moment from "moment";
import { IEvent } from "../utilities/models";

const MOD = "eventsHandler.ts";

@singleton()
export class EventsHandler {
    private events: IEvent[] = [];

    constructor(private logger: Logger) {
        this.loadEvents();
    }

    loadEvents(callback?: (err?: string) => void): void {
        this.events = [];
        fs.readFile("./events.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read events: ${err}`, MOD);
                if (callback) callback(err.message);
                return;
            }

            var model = JSON.parse(data.toString());

            if (!model) {
                this.logger.warn("Couldn't find any events.", MOD);
                if (callback) callback("Couldn't find events data.");
                return;
            }

            model.forEach((obj: IEvent) => this.events.push(obj));

            this.logger.info("Events loaded", MOD);
            if (callback) callback();
        });
    }

    getEvents(): IEvent[] {
        this.clearPastEvents();

        return this.events;
    }

    addEvent(event: IEvent): void {
        this.events.push(event);

        this.saveEvents();
    }

    private clearPastEvents(): void {
        this.events = this.events.filter((event) => moment(event.date).isAfter(moment()));

        this.saveEvents();
    }

    private saveEvents(): void {
        fs.writeFile("./events.json", JSON.stringify(this.events), (err) => {
            if (err) this.logger.error(`Failed to save events: ${err}`, MOD);
        });
    }
}