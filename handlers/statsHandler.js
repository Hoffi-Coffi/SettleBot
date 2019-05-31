var logger = require("../utilities/logger");
var fs = require("fs");

const MOD = "statsHandler.js";

var stats = exports;

var storedStats = [];

function loadStats() {
    fs.readFile("./stats.json", (err, data) => {
        if (err) {
            logger.error(`Failed to read stats: ${err}`, MOD);
            return;
        }

        var model = JSON.parse(data.toString());

        if (!model) {
            logger.warn("Couldn't find any stats data.", MOD);
            return;
        }

        model.forEach((obj) => storedStats.push(obj));

        logger.info("Stats loaded", MOD);
    });
};

loadStats();

stats.increment = (stat = "") => {
    stat = stat.toLowerCase();

    var findStat = storedStats.find((obj) => obj.name === stat);

    if (findStat) {
        storedStats.splice(storedStats.indexOf(findStat), 1);

        findStat.count = findStat.count + 1;
        storedStats.push(findStat);
    } else {
        storedStats.push({
            name: stat,
            count: 1
        });
    }
}

stats.getStat = (stat = "") => {
    stat = stat.toLowerCase();

    var foundStat = storedStats.find((obj) => obj.name.toLowerCase() === stat);

    if (foundStat) return foundStat.count;
    else return 0;
};

stats.shutdown = (callback) => {
    logger.info("Saving stats...", MOD);
    fs.writeFile("./stats.json", JSON.stringify(storedStats), (err) => {
        if (err) logger.error(`Failed to update stats file: ${err}`, MOD);
        else callback();
    })
}