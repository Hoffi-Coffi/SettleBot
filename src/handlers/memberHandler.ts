import { singleton } from 'tsyringe';
import { Logger } from '../utilities/logger';
import * as fs from 'fs';

const MOD = "memberHandler.ts";

interface Member {
    rsn: string,
    user: string
};

@singleton()
export class MemberHandler {
    private registeredNames: Member[] = [];

    constructor(private logger: Logger) {
        this.load();
    }

    private load(): void {
        fs.readFile("./rsns.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read RSN file: ${err}`);
                return;
            }
    
            this.registeredNames = JSON.parse(data.toString());
    
            this.logger.info("Memberlist loaded", MOD);
        });
    }

    register(rsn: string, user: string): void {
        var existing = this.registeredNames.find(name => name.user === user);

        if (!existing) {
            this.registeredNames.push({
                rsn: rsn,
                user: user
            });
        } else {
            this.registeredNames.splice(this.registeredNames.indexOf(existing), 1);
            existing.rsn = rsn;

            this.registeredNames.push(existing);
        }

        this.save();
    }

    get(user: string): Member {
        return this.registeredNames.find(name => name.user === user);
    }

    getByRsn(rsn: string): Member {
        return this.registeredNames.find(name => name.rsn === rsn);
    }

    private save(): void {
        fs.writeFile("./rsns.json", JSON.stringify(this.registeredNames), (err) => {
            if (err) this.logger.error(`Failed to update Memberlist file: ${err}`, MOD);
        });
    }
};