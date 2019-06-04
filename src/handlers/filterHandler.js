const logger = require('../utilities/logger');
const fs = require('fs');

const MOD = "filterHandler.js";

var badWords = require('./../badwords.json');

var filter = exports;

filter.addword = function(action = "", word = "") {
    fs.readFile('./badwords.json', (err, data) => {
        if (err) {
            logger.error(`Failed to read badwords file: ${err}`, MOD);
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
            case "gotspoiler":
                if (model.gotspoiler.indexOf(word) < 0) model.gotspoiler.push(word);
                break;
        }
    
        fs.writeFile('./badwords.json', JSON.stringify(model), (err) => {
            if (err) logger.error(`Failed to update badwords file: ${err}`, MOD);
            else filter.reloadBadWords();
        });
    });
}

filter.rmword = function(action = "", word = "") {
    fs.readFile('./badwords.json', (err, data) => {
        if (err) {
            logger.error(`Failed to read badwords file: ${err}`, MOD);
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
            if (err) logger.error(`Failed to update badwords file: ${err}`, MOD);
            else filter.reloadBadWords();
        });
    });
}

filter.checkword = function(word) {
    var check = word.replace(/[^0-9a-zA-Z]/gi, '').toLowerCase();

    if (badWords.mute.includes(check)) return "mute";
    if (badWords.delete.includes(check)) return "delete";
    if (badWords.gotspoiler.includes(check)) return "gotspoiler";

    return null;
}

filter.reloadBadWords = () => {
    delete require.cache[require.resolve('./../badwords.json')];
    logger.info('Reloading "badwords" data file...');
    badWords = require('./../badwords.json');
}