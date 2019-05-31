const logger = require("../utilities/logger");
const formatter = require("../utilities/formatter");

const cheerio = require("cheerio");
const moment = require("moment");
const https = require("https");
const FormData = require("form-data");

const configHandler = require('./configHandler');

const MOD = "cmlHandler.js";

var cml = exports;

var baseURL = "https://crystalmathlabs.com/tracker";

var siteBaseURL = `${baseURL}/competitions.php?competition=`;
var updateURL = `${baseURL}/update.php?player=`;
var statsURL = `${baseURL}/virtualhiscores.php?page=statistics&competition=`;
var createURL = `${baseURL}/compcreate.php`;
var groupEditURL = `${baseURL}/groupedit.php?group=`;

var playerList = undefined;
var queuedData = [];

//#region Competition Creation
cml.getGroup = (callback) => {
    var compId = configHandler.getSetting("sotwCompId");

    var url = statsURL + compId;

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            var $ = cheerio.load(data);

            var links = $('#content').children('a');

            var group = links.first().attr('href').split('=')[1];

            if (group && callback) callback(group);
        });
    });
}

cml.getUserList = (group, callback) => {
    var url = `${createURL}?group=${group}`;

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            var $ = cheerio.load(data);

            var textCheck = $('#content').text();
            if (textCheck.indexOf("You must wait") > -1) {
                callback(null, textCheck.split("According")[0]);
                return;
            }

            var textArea = $("textarea[name='players']");

            playerList = textArea.val();

            if (playerList && callback) callback(playerList);
        });
    });
}

cml.stageData = (skill, callback) => {
    queuedData = [];

    var compNumber = parseInt(configHandler.getSetting("sotwCompNum")) + 1;

    queuedData.push({
        name: "title",
        value: "Settlement SOTW #" + compNumber
    });

    var now = new Date();
    now.setMinutes(now.getUTCMinutes() + 2);
    //now.setMinutes(Math.ceil(now.getUTCMinutes() / 30) * 30);
    var day = now.getUTCDate().toString();
    if (now.getUTCDate() < 10) day = "0" + day;

    queuedData.push({
        name: "start_date",
        value: `${now.getUTCFullYear()}-${formatter.mapMonth(now.getUTCMonth()+1)}-${day}`
    });

    var time = formatter.convertTime(`${now.getUTCHours()}:${now.getUTCMinutes()}`, null, false);
    queuedData.push({
        name: "start_time",
        value: time
    });

    var end = new Date(now);
    end.setDate(end.getUTCDate() + 7);
    day = end.getUTCDate().toString();
    if (end.getUTCDate() < 10) day = "0" + day;

    queuedData.push({
        name: "end_date",
        value: `${end.getUTCFullYear()}-${formatter.mapMonth(end.getUTCMonth()+1)}-${day}`
    });

    queuedData.push({
        name: "end_time",
        value: time
    });

    queuedData.push({
        name: "players",
        value: playerList
    });

    queuedData.push({
        name: "stat",
        value: skill
    });

    queuedData.push({
        name: "password",
        value: "yo"
    });

    if (callback) callback(queuedData);
}

cml.abandonComp = (callback) => {
    if (!playerList && queuedData.length < 1) {
        callback("no competition is currently pending.");
        return;
    }

    playerList = undefined;
    queuedData = [];

    callback("done!");
}

cml.createNewComp = (callback) => {
    if (!playerList || queuedData.length < 1) return; //handle better

    var form = new FormData();

    logger.info("Attempting creation of new SOTW with data:");

    queuedData.forEach((val) => {
        var value = val.value;
        form.append(val.name, value);

        if (val.name === "players") value = value.split("\n").length + " players";

        logger.info(`Name: ${val.name} | Value: ${value}`);
    });

    var url = `${createURL}`;
    form.submit(url, (err, res) => {
        if (err) console.log(err);
        else {
            var loc = res.headers.location;

            var newCompId = loc.split('=')[1];

            if (newCompId && callback) callback(newCompId, queuedData);
        }
        res.resume();
    })
}
//#endregion

cml.addPlayer = (player, group, callback) => {
    var compId = configHandler.getSetting("sotwCompId");

    var form = new FormData();

    form.append("mode", "add");
    form.append("group", group);
    form.append("refer", siteBaseURL + compId);
    form.append("player", player);
    form.append("password", "yo");

    var url = groupEditURL + group;
    form.submit(url, (err, res) => {
        if (err) logger.error(`Failed to add "${player}" to CML. Reason: ${err}`, MOD);
        else if (callback) callback();
    });
}

cml.getData = (callback) => {
    var compId = configHandler.getSetting("sotwCompId");

    var url = siteBaseURL + compId + "&count=200";

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            var $ = cheerio.load(data);

            var table = $('#competition_table > tbody');

            var callbackData = '';

            var rows = table.children('tr');

            rows.each((i, elem) => {
                if (i === 0 || i === rows.length - 1) return;
                var row = $(elem);

                row.children('td').each((i2, elem2) => {
                    if (i2 === 4) return;

                    var cell = $(elem2);
                    if (i2 === 0) {
                        callbackData += cell.children('a').first().html().trim().split('&#xA0;').join('_') + ',';
                    } else {
                        callbackData += cell.text().trim().replace('+', '').split(',').join('');

                        if (i2 !== 3) callbackData += ",";
                    }
                });

                callbackData += "\n";
            });

            callback(callbackData);
        });

        res.on('error', (err) => {
            logger.error(`Failed to get SOTW data: ${err}`, MOD);
        });
    })
}

cml.updatePlayer = (player, callback) => {
    var url = updateURL + player;

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () =>  {
            if (callback) {
                var $ = cheerio.load(data);

                var content = $('#content').text();

                callback(content)
            }
        });
    });
}

cml.scrape = (callback, overrideCompId) => {
    var compId = overrideCompId;

    if (!compId) compId = configHandler.getSetting("sotwCompId");

    var url = siteBaseURL + compId;

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            var $ = cheerio.load(data);

            var sidebar = $('#sidebar > ul > li');

            var skill = "";
            var start;
            var end;

            sidebar.each((i, elem) => {
                //so hacky but I blame CML for making me do this
                switch (i) {
                    case 0:
                        skill = $(elem).text().trim();
                        break;
                    case 3:
                        start = formatter.momentifyDate($(elem).text().replace("Started", "").replace(/ *\([^)]*\) */g, "").trim());
                        break;
                    case 4:
                        end = formatter.momentifyDate($(elem).text().replace("Ended", "").replace("Ends", "").replace(/ *\([^)]*\) */g, "").trim());
                        break;
                }
            });

            var settings = [];

            settings.push({
                name: "sotwSkill",
                value: skill
            });

            settings.push({
                name: "sotwStart",
                value: start
            });

            settings.push({
                name: "sotwEnd",
                value: end
            });

            configHandler.updateMultipleSettings(settings, callback);
        });
    })
}

cml.sotwlink = () => siteBaseURL + configHandler.getSetting("sotwCompId");

cml.sotw = function(callback, limitTop = 5, search = "") {
    cml.getData((data) => {
        var lines = data.split('\n');
        
        var longestName = 4, longestStart = 5, longestEnd = 3, longestGain = 4;

        var found = lines.find((obj) => {
            var line = obj.split(",");
            return line[0].toLowerCase().trim() === search.toLowerCase().trim();
        });

        if (found) {
            var line = found.split(',');
            var foundName = formatter.formatRSN(line[0].trim());
            if (foundName.length > longestName) longestName = foundName.length;

            var foundStart = parseInt(line[1].trim()).toLocaleString();
            if (foundStart.length > longestStart) longestStart = foundStart.length;

            var foundEnd = parseInt(line[2].trim()).toLocaleString();
            if (foundEnd.length > longestEnd) longestEnd = foundEnd.length;

            var foundGain = parseInt(line[3].trim()).toLocaleString();
            if (foundGain.length > longestGain) longestGain = foundGain.length;
        }

        var i = 0;
        lines.forEach((obj) => {
            i++;
            if (i > limitTop) return;
            if (obj.length < 4) return;
            var line = obj.split(',');

            var name = formatter.formatRSN(line[0].trim());
            if (name.length > longestName) longestName = name.length;
            var start = parseInt(line[1].trim()).toLocaleString();
            if (start.length > longestStart) longestStart = start.length;
            var end = parseInt(line[2].trim()).toLocaleString();
            if (end.length > longestEnd) longestEnd = end.length;
            var gain = parseInt(line[3].trim()).toLocaleString();
            if (gain.length > longestGain) longestGain = gain.length;
        });

        var sepLine = "┌──────┬─";
        sepLine = `${sepLine.pad(longestName, "─")}─┬─`;
        sepLine = `${sepLine.pad(longestStart, "─")}─┬─`;
        sepLine = `${sepLine.pad(longestEnd, "─")}─┬─`;
        sepLine = `${sepLine.pad(longestGain, "─")}─┐`;

        var textLine = `Skill: ${configHandler.getSetting("sotwSkill")}`;
        var padEnd = sepLine.length - 4 - textLine.length;
        var result = `${sepLine.split('┬').join('─')}\n│ ${textLine}`;

        var sotwStart = moment(configHandler.getSetting("sotwStart"));
        textLine = `Started: ${sotwStart.format('Do MMM YYYY, h:mmA')} GMT`;
        result = `${result.pad(padEnd, " ")} │\n│ ${textLine}`;

        padEnd = sepLine.length - 4 - textLine.length;
        result = `${result.pad(padEnd, " ")} │\n`;

        var sotwEnd = moment(configHandler.getSetting("sotwEnd"));
        var endWord = "Ends";
        if (sotwEnd.isBefore(moment())) endWord = "Ended";

        textLine = `${endWord}: ${sotwEnd.format('Do MMM YYYY, h:mmA')} GMT`;
        result += `│ ${textLine}`;

        padEnd = sepLine.length - 4 - textLine.length;
        result = `${result.pad(padEnd, " ")} │\n│`;

        if (sotwEnd.isAfter(moment())) {
            textLine = `Ends ${sotwEnd.fromNow()}`;
            result += ` ${textLine}`;

            padEnd = sepLine.length - 4 - textLine.length;
            result = `${result.pad(padEnd, " ")} │\n│`;
        }

        padEnd = sepLine.length - 2;
        result = `${result.pad(padEnd, " ")}│\n`;

        sepLine = sepLine.replace("┌", "├").replace("┐", "┤");
        result += `${sepLine}\n│ Pos. │ RSN`;

        padEnd = longestName - 3;
        result = `${result.pad(padEnd, " ")} │ Start`;

        padEnd = longestStart - 5;
        result = `${result.pad(padEnd, " ")} │ End`;

        padEnd = longestEnd - 3;
        result = `${result.pad(padEnd, " ")} │ Gain`;

        sepLine = sepLine.split("┬").join("┼");

        padEnd = longestGain - 4;
        result = `${result.pad(padEnd, " ")} │\n${sepLine}`;

        i = 0;
        lines.forEach((obj) => {
            i++;
            if (i > limitTop) return;
            if (obj.length < 1) return;
            var line = obj.split(',');

            result += `\n│ ${i}`;

            padEnd = 4 - i.toString().length;
            var name = formatter.formatRSN(line[0].trim());
            result = `${result.pad(padEnd, " ")} │ ${name}`;

            padEnd = longestName - name.length;
            var start = parseInt(line[1]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${start}`;

            padEnd = longestStart - start.length;
            var end = parseInt(line[2]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${end}`;

            padEnd = longestEnd - end.length;
            var gain = parseInt(line[3]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${gain}`;

            padEnd = longestGain - gain.length;
            result = `${result.pad(padEnd, " ")} │`;
        });

        var reduce = 0;

        if (search && search.length > 0 && result.indexOf(formatter.formatRSN(search.toLowerCase()).trim()) < 0 && found) {
            reduce++;
            result += `\n│ ..`;

            result = `${result.pad(2, " ")} │ ..`;

            padEnd = longestName - 2;
            result = `${result.pad(padEnd, " ")} │ ..`;

            padEnd = longestStart - 2;
            result = `${result.pad(padEnd, " ")} │ ..`;

            padEnd = longestEnd - 2;
            result = `${result.pad(padEnd, " ")} │ ..`;

            padEnd = longestGain - 2;
            result = `${result.pad(padEnd, " ")} │\n`;

            var line = found.split(',');

            var pos = lines.indexOf(found) + 1;
            result += `│ ${pos}`;

            padEnd = 4 - pos.toString().length;
            var name = formatter.formatRSN(line[0].trim());
            result = `${result.pad(padEnd, " ")} │ ${name}`;

            padEnd = longestName - name.length;
            var start = parseInt(line[1]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${start}`;

            padEnd = longestStart - start.length;
            var end = parseInt(line[2]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${end}`;

            padEnd = longestEnd - end.length;
            var gain = parseInt(line[3]).toLocaleString();
            result = `${result.pad(padEnd, " ")} │ ${gain}`;

            padEnd = longestGain - gain.length;
            result = `${result.pad(padEnd, " ")} │`;
        }

        sepLine = sepLine.split("┼").join("┴");

        result += `\n${sepLine}`;

        sepLine = sepLine.replace("├", "└").split("┴").join("─").replace("┤", "┘");

        if (lines.length > limitTop) {
            result += "\n";

            var text = `...plus ${lines.length - limitTop - reduce} more...`;

            padEnd = sepLine.length - 4 - text.length;
            result += `│ ${text}`;

            result = `${result.pad(padEnd, " ")} │\n${sepLine}`;
        }

        callback("```" + result + "```");
    });
};