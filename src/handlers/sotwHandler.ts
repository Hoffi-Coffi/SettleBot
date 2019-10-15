import { singleton } from "tsyringe";
import { SotwCompetition, SotwCompetitor } from "../utilities/models";
import { Logger } from "../utilities/logger";
import * as fs from "fs";

const MOD = "sotwHandler.ts";

@singleton()
export class SotwHandler {
    private competition: SotwCompetition;
    private stagedCompetition: SotwCompetition;

    constructor(private logger: Logger) {
        this.loadCompetition();
    }

    loadCompetition(): void {
        this.competition = null;

        fs.readFile("./sotw.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read competition: ${err}`, MOD);
                return;
            }

            this.competition = JSON.parse(data.toString());

            if (!this.competition) {
                this.logger.warn("Couldn't find a competition.", MOD);
                return;
            }

            this.logger.info("Competition loaded", MOD);
        });
    }

    getActiveComp(): SotwCompetition {
        return this.competition;
    }

    getStagedComp(): SotwCompetition {
        return this.stagedCompetition;
    }

    abandonStagedComp(): boolean {
        if (!this.stagedCompetition) return false;

        this.stagedCompetition = null;
        return true;
    }

    stageNewComp(comp: SotwCompetition): void {
        this.stagedCompetition = comp;
    }

    activateStagedComp(): boolean {
        if (!this.stagedCompetition) return false;

        this.competition = this.stagedCompetition;
        this.stagedCompetition = null;

        this.saveCompetition();
        return true;
    }

    addOrUpdateCompetitor(competitor: SotwCompetitor): void {
        var search = this.competition.competitors.find((obj) => obj.rsn === competitor.rsn);

        if (search) {
            this.competition.competitors.splice(this.competition.competitors.indexOf(search), 1);
            
            this.competition.competitors.push(competitor);
        } else {
            this.competition.competitors.push(competitor);
        }

        this.saveCompetition();
    }

    addStagedCompetitor(competitor: SotwCompetitor): void {
        this.stagedCompetition.competitors.push(competitor);
    }

    private saveCompetition(): void {
        fs.writeFile("./sotw.json", JSON.stringify(this.competition), (err) => {
            if (err) this.logger.error(`Failed to save competition: ${err}`, MOD);
        });
    }
}