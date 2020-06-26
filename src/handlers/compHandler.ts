import { singleton } from "tsyringe";
import { Competition, Competitor } from "../utilities/models";
import { Logger } from "../utilities/logger";
import * as fs from "fs";

const MOD = "compHandler.ts";

@singleton()
export class CompHandler {
    private competition: Competition;
    private stagedCompetition: Competition;

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

    getActiveComp(): Competition {
        return this.competition;
    }

    getStagedComp(): Competition {
        return this.stagedCompetition;
    }

    abandonStagedComp(): boolean {
        if (!this.stagedCompetition) return false;

        this.stagedCompetition = null;
        return true;
    }

    stageNewComp(comp: Competition): void {
        this.stagedCompetition = comp;
    }

    activateStagedComp(): boolean {
        if (!this.stagedCompetition) return false;

        this.competition = this.stagedCompetition;
        this.stagedCompetition = null;

        this.saveCompetition();
        return true;
    }

    addOrUpdateCompetitor(competitor: Competitor): void {
        var search = this.competition.competitors.find((obj) => obj.rsn === competitor.rsn);

        if (search) this.competition.competitors.splice(this.competition.competitors.indexOf(search), 1);

        this.competition.competitors.push(competitor);

        this.saveCompetition();
    }

    addStagedCompetitor(competitor: Competitor): void {
        this.stagedCompetition.competitors.push(competitor);
    }

    private saveCompetition(): void {
        fs.writeFile("./sotw.json", JSON.stringify(this.competition), (err) => {
            if (err) this.logger.error(`Failed to save competition: ${err}`, MOD);
        });
    }
}