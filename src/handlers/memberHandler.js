var logger = require("../utilities/logger");
var fs = require("fs");

const MOD = "memberHandler.js";

var member = exports;

var registeredNames = [];

function load() {
    fs.readFile("./rsns.json", (err, data) => {
        if (err) {
            logger.error(`Failed to read RSN file: ${err}`);
            return;
        }

        registeredNames = JSON.parse(data.toString());

        logger.info("Memberlist loaded", MOD);
    });
}

load();

member.register = (rsn = "", user = "") => {
    var existing = registeredNames.find(name => name.user === user);

    if (!existing) {
        registeredNames.push({
            rsn: rsn,
            user: user
        });
    } else {
        registeredNames.splice(registeredNames.indexOf(existing), 1);
        existing.rsn = rsn;

        registeredNames.push(existing);
    }
}
 
member.get = (user = "") => registeredNames.find(name => name.user === user);

member.shutdown = (callback) => member.save(callback);

member.save = (callback) => {
    logger.info("Saving memberlist...", MOD);
    fs.writeFile("./rsns.json", JSON.stringify(registeredNames), (err) => {
        if (err) logger.error(`Failed to update Memberlist file: ${err}`, MOD);
        else if (callback) callback();
    });
}