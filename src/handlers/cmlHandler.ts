import { singleton } from "tsyringe";
import * as cheerio from "cheerio";
import * as moment from "moment";
import * as https from "https";
import * as FormData from "form-data";

import { Logger } from "../utilities/logger";
import Formatter from "../utilities/formatter";

import { ConfigHandler } from "../handlers/configHandler";

const MOD = "cmlHandler.ts";

const baseURL = "https://crystalmathlabs.com/tracker";

const siteBaseURL = `${baseURL}/competitions.php?competition=`;
const updateURL = `${baseURL}/update.php?player=`;
const statsURL = `${baseURL}/virtualhiscores.php?page=statistics&competition=`;
const createURL = `${baseURL}/compcreate.php`;
const groupEditURL = `${baseURL}/groupedit.php?group=`;

@singleton()
export class CmlHandler {
    private playerList = undefined;
    private queuedData = [];

    constructor(private logger: Logger, private configHandler: ConfigHandler) {}

    getGroup(callback: Function): void {
        var compId = this.configHandler.getSetting("sotwCompId");

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

    getUserList(group: string, callback: Function): void {
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

                this.playerList = textArea.val();

                if (this.playerList && callback) callback(this.playerList);
            });
        });
    }

    stageData(skill: string, callback: Function): void {
        this.queuedData = [];

        var compNumber = parseInt(this.configHandler.getSetting("sotwCompNum")) + 1;

        this.queuedData.push({
            name: "title",
            value: "Settlement SOTW #" + compNumber
        });

        var now = new Date();
        now.setMinutes(Math.ceil(now.getUTCMinutes() / 30) * 30);
        var day = now.getUTCDate().toString();
        if (now.getUTCDate() < 10) day = "0" + day;

        this.queuedData.push({
            name: "start_date",
            value: `${now.getUTCFullYear()}-${Formatter.mapMonth(now.getUTCMonth()+1)}-${day}`
        });

        var time = Formatter.convertTime(`${now.getUTCHours()}:${now.getUTCMinutes()}`, null, false);
        this.queuedData.push({
            name: "start_time",
            value: time
        });

        var end = new Date(now);
        end.setDate(end.getUTCDate() + 7);
        day = end.getUTCDate().toString();
        if (end.getUTCDate() < 10) day = "0" + day;

        this.queuedData.push({
            name: "end_date",
            value: `${end.getUTCFullYear()}-${Formatter.mapMonth(end.getUTCMonth()+1)}-${day}`
        });

        this.queuedData.push({
            name: "end_time",
            value: time
        });

        this.queuedData.push({
            name: "players",
            value: this.playerList
        });

        this.queuedData.push({
            name: "stat",
            value: skill
        });

        this.queuedData.push({
            name: "password",
            value: "yo"
        });

        if (callback) callback(this.queuedData);
    }

    abandonComp(callback: Function): void {
        if (!this.playerList && this.queuedData.length < 1) {
            callback("no competition is currently pending.");
            return;
        }
    
        this.playerList = undefined;
        this.queuedData = [];
    
        callback("done!");
    }

    createNewComp(callback: Function): void {
        if (!this.playerList || this.queuedData.length < 1) return; //todo handle better

        var form = new FormData();

        this.logger.info("Attempting creation of new SOTW with data:");

        this.queuedData.forEach((val) => {
            var value = val.value;
            form.append(val.name, value);

            if (val.name === "players") value = value.split("\n").length + " players";

            this.logger.info(`Name: ${val.name} | Value: ${value}`);
        });

        var url = `${createURL}`;
        form.submit(url, (err, res) => {
            if (err) console.log(err);
            else {
                var loc = res.headers.location;

                var newCompId = loc.split('=')[1];

                if (newCompId && callback) callback(newCompId, this.queuedData);
            }
            res.resume();
        });
    }

    addPlayer(player: string, group: string, callback: Function): void {
        var compId = this.configHandler.getSetting("sotwCompId");

        var form = new FormData();

        form.append("mode", "add");
        form.append("group", group);
        form.append("refer", siteBaseURL + compId);
        form.append("player", player);
        form.append("password", "yo");

        var url = groupEditURL + group;
        form.submit(url, (err) => {
            if (err) this.logger.error(`Failed to add "${player}" to CML. Reason: ${err}`, MOD);
            else if (callback) callback();
        });
    }

    getData(callback: (data: string) => any): void {
        var compId = this.configHandler.getSetting("sotwCompId");

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
                this.logger.error(`Failed to get SOTW data: ${err}`, MOD);
            });
        });
    }

    updatePlayer(player: string, callback: Function): void {
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

    scrape(callback: Function, overrideCompId?: string) {
        var compId = overrideCompId;

        if (!compId) compId = this.configHandler.getSetting("sotwCompId");

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
                            start = Formatter.momentifyDate($(elem).text().replace("Started", "").replace(/ *\([^)]*\) */g, "").trim());
                            break;
                        case 4:
                            end = Formatter.momentifyDate($(elem).text().replace("Ended", "").replace("Ends", "").replace(/ *\([^)]*\) */g, "").trim());
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

                this.configHandler.updateMultipleSettings(settings, callback);
            });
        });
    }

    sotwlink(): string {
        return siteBaseURL + this.configHandler.getSetting("sotwCompId");
    }

    sotw(callback: Function, limitTop: number = 5, search?: string) {
        this.getData((data) => {
            var lines = data.split('\n');
            
            var longestName = 4, longestStart = 5, longestEnd = 3, longestGain = 4;
    
            var found = lines.find((obj) => {
                var line = obj.split(",");
                return line[0].toLowerCase().trim() === search.toLowerCase().trim();
            });
    
            if (found) {
                var line = found.split(',');
                var foundName = Formatter.formatRSN(line[0].trim());
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
    
                var name = Formatter.formatRSN(line[0].trim());
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
    
            var textLine = `Skill: ${this.configHandler.getSetting("sotwSkill")}`;
            var padEnd = sepLine.length - 4 - textLine.length;
            var result = `${sepLine.split('┬').join('─')}\n│ ${textLine}`;
    
            var sotwStart = moment(this.configHandler.getSetting("sotwStart"));
            textLine = `Started: ${sotwStart.format('Do MMM YYYY, h:mmA')} GMT`;
            result = `${result.pad(padEnd, " ")} │\n│ ${textLine}`;
    
            padEnd = sepLine.length - 4 - textLine.length;
            result = `${result.pad(padEnd, " ")} │\n`;
    
            var sotwEnd = moment(this.configHandler.getSetting("sotwEnd"));
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
                var name = Formatter.formatRSN(line[0].trim());
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
    
            if (search && search.length > 0 && result.indexOf(Formatter.formatRSN(search.toLowerCase()).trim()) < 0 && found) {
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
                var name = Formatter.formatRSN(line[0].trim());
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
    }
};