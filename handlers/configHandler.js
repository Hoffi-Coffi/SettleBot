const logger = require("../utilities/logger");
const fs = require("fs");

const MOD = "configHandler.js";

var config = exports;

var configLoaded = false;
var configItems = undefined;

function loadConfig(forceReload = false, callback = undefined) {
    if (!forceReload && configLoaded) return;

    fs.readFile("./config.json", (err, data) => {
        if (err) {
            logger.error(`Failed to read config: ${err}`, MOD);
            return;
        }

        configItems = JSON.parse(data.toString()).config;
        configLoaded = true;
        logger.info("Config loaded", MOD);

        if (callback) callback();
    });
}

loadConfig();

config.getSetting = function(name = "") {
    if (!configLoaded) return null;

    name = name.toLowerCase();

    var setting = configItems.find((obj) => {
        return obj.startsWith(name);
    });

    if (setting) return setting.replace(`${name}:`, "");
    else return null;
};

config.updateMultipleSettings = function(settings, callback = undefined) {
    fs.readFile("./config.json", (err, data) => {
        if (err) {
            logger.error(`Failed to read config: ${err}`, MOD);
            return;
        }

        var model = JSON.parse(data.toString());

        settings.forEach((setting) => {
            var name = setting.name.toLowerCase();
            var value = setting.value;

            var setting = configItems.find((obj) => {
                return obj.startsWith(name);
            });
    
            if (!setting) return;
    
            var idx = model.config.indexOf(setting);
            if (idx > -1) {
                model.config.splice(idx, 1);
    
                model.config.push(`${name}:${value}`);
            }
        });

        fs.writeFile("./config.json", JSON.stringify(model), (err) => {
            if (err) logger.error(`Failed to update config: ${err}`, MOD);
            else loadConfig(true, callback);
        });
    });
}

config.updateSetting = function(name = "", value = "", callback = undefined) {
    config.updateMultipleSettings([{
        name: name,
        value: value
    }], callback);
}