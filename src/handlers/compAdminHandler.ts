import { singleton } from "tsyringe";
import { Logger } from "../utilities/logger";
import * as fs from "fs";
import { Member } from "../utilities/models";

const MOD = "compAdminHandler.ts";

@singleton()
export class CompAdminHandler {
    private competitors: Member[] = [];

    constructor(private logger: Logger) {
        this.loadCompetitors();
    }

    loadCompetitors(): void {
        this.competitors = [];
        fs.readFile("./competitors.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read competitors: ${err}`, MOD);
                return;
            }

            var model = JSON.parse(data.toString());

            if (!model) {
                this.logger.warn("Couldn't find any competitors.", MOD);
                return;
            }

            model.forEach((obj: Member) => this.competitors.push(obj));

            this.logger.info("Competitors loaded", MOD);
        });
    }

    addCompetitor(competitor: Member): boolean {
        if (this.competitors.indexOf(competitor) > -1) return false;

        this.competitors.push(competitor);

        this.saveCompetitors();
        return true;
    }

    clearCompetitors(): void {
        this.competitors = [];

        this.saveCompetitors();
    }

    getCompetitors(): Member[] {
        return this.competitors;
    }

    private saveCompetitors(): void {
        fs.writeFile("./competitors.json", JSON.stringify(this.competitors), (err) => {
            if (err) this.logger.error(`Failed to save competitors: ${err}`, MOD);
        });
    }
}