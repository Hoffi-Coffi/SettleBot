import { singleton } from 'tsyringe';
import { Logger } from '../utilities/logger';
import * as fs from 'fs';

const MOD = "memberHandler.js";

@singleton()
export class MemberHandler {
    private registeredNames = []; //todo type up

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
    }

    get(user: string) {
        return this.registeredNames.find(name => name.user === user);
    }

    shutdown(callback: Function): void {
        this.save(callback);
    }

    save(callback: Function): void {
        this.logger.info("Saving memberlist...", MOD);
        fs.writeFile("./rsns.json", JSON.stringify(this.registeredNames), (err) => {
            if (err) this.logger.error(`Failed to update Memberlist file: ${err}`, MOD);
            else if (callback) callback();
        });
    }
};