import { singleton } from "tsyringe";

@singleton()
export class OffenderHandler {
    private offenses = [];

    constructor() {}

    add(name: string): void {
        var offender = this.offenses.find(off => off.name === name);

        if (offender) {
            this.offenses.splice(this.offenses.indexOf(offender), 1);
            offender.count = offender.count + 1;

            this.offenses.push(offender);
        } else {
            this.offenses.push({
                name: name,
                count: 1
            });
        }
    }

    check(name: string): "warn" | "mute" {
        var offender = this.offenses.find(off => off.name === name);

        if (!offender) return null;

        if (offender.count === 3) return "warn";
        if (offender.count === 4) return "mute";

        return null;
    }

    count(name: string): number {
        var offender = this.offenses.find(off => off.name === name);

        return (offender) ? offender.count : 0;
    }
};