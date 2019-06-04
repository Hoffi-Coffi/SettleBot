import { singleton } from 'tsyringe';
import * as fs from 'fs';

import { Logger } from '../utilities/logger';

var badWords = require("./../badwords.json");

const MOD = "filterHandler.ts";

@singleton()
export class FilterHandler {
    constructor(private logger: Logger) {}

    addword(action: string, word: string): void {
        fs.readFile('./badwords.json', (err, data) => {
            if (err) {
                this.logger.error(`Failed to read badwords file: ${err}`, MOD);
                return;
            }
    
            var model = JSON.parse(data.toString());
    
            switch (action) {
                case "delete":
                    if (model.delete.indexOf(word) < 0) model.delete.push(word);
                    break;
                case "mute":
                    if (model.mute.indexOf(word) < 0) model.mute.push(word);
                    break;
            }
        
            fs.writeFile('./badwords.json', JSON.stringify(model), (err) => {
                if (err) this.logger.error(`Failed to update badwords file: ${err}`, MOD);
                else this.reloadBadWords();
            });
        });
    }

    rmword(action: string, word: string): void {
        fs.readFile('./badwords.json', (err, data) => {
            if (err) {
                this.logger.error(`Failed to read badwords file: ${err}`, MOD);
                return;
            }
    
            var model = JSON.parse(data.toString());
    
            switch (action) {
                case "delete":
                    var idx = model.delete.indexOf(word);
                    if (idx > -1) {
                        model.delete.splice(idx, 1);
                    }
                    break;
                case "mute":
                    var idx = model.mute.indexOf(word);
                    if (idx > -1) {
                        model.mute.splice(idx, 1);
                    }
                    break;
                case "gotspoiler":
                    var idx = model.mute.indexOf(word);
                    if (idx > -1) model.mute.splice(idx, 1);
                    break;
            }
        
            fs.writeFile('./badwords.json', JSON.stringify(model), (err) => {
                if (err) this.logger.error(`Failed to update badwords file: ${err}`, MOD);
                else this.reloadBadWords();
            });
        });
    }

    checkword(word: string): "mute" | "delete" {
        var check = word.replace(/[^0-9a-zA-Z]/gi, '').toLowerCase();

        if (badWords.mute.includes(check)) return "mute";
        if (badWords.delete.includes(check)) return "delete";

        return null;
    }

    private reloadBadWords(): void {
        delete require.cache[require.resolve('./../badwords.json')];
        this.logger.info('Reloading "badwords" data file...');
        badWords = require('./../badwords.json');
    }
};