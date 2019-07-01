import "reflect-metadata";
import * as fs from 'fs';

var badWordsModel = {
    delete: [],
    mute: []
};

fs.writeFile('./src/badwords.json', JSON.stringify(badWordsModel), (err) => {
    if (err) throw err;
});