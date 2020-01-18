import * as fs from "fs";
import { singleton } from "tsyringe";
import { Skills } from "../utilities/models";
import { Logger } from "../utilities/logger";

const MOD = "skillsHandler.ts";

@singleton()
export class SkillsHandler {
    private skills: Skills;

    constructor(private logger: Logger) {
        this.loadSkills();
    }

    private loadSkills(): void {
        this.skills = null;

        fs.readFile("./skills.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read skill data: ${err}`, MOD);
                return;
            }

            this.skills = JSON.parse(data.toString());

            if (!this.skills) {
                this.logger.warn("Couldn't find skill data.", MOD);
                return;
            }

            this.logger.info("Skill data loaded", MOD);
        });
    }

    getSkillOptions(): string[] {
        return this.skills.uncompeted;
    }

    setSkillCompeted(skill: string): void {
        if (this.skills.uncompeted.indexOf(skill) < 0) return;

        this.skills.uncompeted.splice(this.skills.uncompeted.indexOf(skill), 1);

        this.skills.competed.push(skill);

        this.saveSkills();
    }

    private saveSkills(): void {
        fs.writeFile("./skills.json", JSON.stringify(this.skills), (err) => {
            if (err) this.logger.error(`Failed to save skill data: ${err}`, MOD);
        });
    }
}