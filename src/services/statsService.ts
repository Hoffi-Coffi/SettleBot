import { singleton } from "tsyringe";
import Discord from "discord.js";
import Canvas from "canvas";

import { Logger } from "../utilities/logger";
import { MemberHandler } from "../handlers/memberHandler";
import Formatter from "../utilities/formatter";
import { CommandType, OsrsSkill } from "../utilities/models";
import { OsrsHandler } from "../handlers/osrsHandler";
import Guard from "../utilities/guard";

const MOD = "statsService.ts";

const positionMap = {
    attack: [40, 22],
    overall: [0, 0],
    defence: [40, 86],
    strength: [40, 54],
    hitpoints: [104, 22],
    ranged: [40, 118],
    prayer: [40, 150],
    magic: [40, 182],
    cooking: [168, 118],
    woodcutting: [168, 182],
    fletching: [104, 182],
    fishing: [168, 86],
    firemaking: [168, 150],
    crafting: [104, 150],
    smithing: [168, 54],
    mining: [168, 22],
    herblore: [104, 86],
    agility: [104, 54],
    thieving: [104, 118],
    slayer: [104, 214],
    farming: [168, 214],
    runecraft: [40, 214],
    hunter: [104, 246],
    construction: [40, 246]
};

const bossMap = [
    {boss: "abyssalSire", match: ["abyssal_sire", "sire", "abyssal"], name: "Abyssal Sire",
        noScore: "{rsn} has never killed the Abyssal Sire.", singleScore: "{rsn} has killed the Abyssal Sire once!", display: "{rsn} has killed the Abyssal Sire **{kc}** times!"},
    {boss: "alchemicalHydra", match: ["alchemical hydra", "hydra"], name: "Alchemical Hydra",
        noScore: "{rsn} has never killed the Alchemical Hydra.", singleScore: "{rsn} has killed the Alchemical Hydra once!",
        display: "{rsn} has killed the Alchemical Hydra **{kc}** times!"},
    {boss: "barrowsChests", match: ["barrows_chests", "barrows_chest", "barrow_chests", "barrow_chest", "barrows", "barrow"], name: "Barrows Chests", 
        noScore: "{rsn} hasn't opened a Barrows Chest.", singleScore: "{rsn} has opened a single Barrows Chest!", display: "{rsn} has opened **{kc}** Barrows Chests!"},
    {boss: "bryophyta", match: ["bryophyta", "bryo"], name: "Bryophyta", 
        noScore: "{rsn} has never killed Bryophyta.", singleScore: "{rsn} has killed Bryophyta once!", display: "{rsn} has killed Bryophyta **{kc}** times!"},
    {boss: "callisto", match: ["call", "callisto"], name: "Callisto",
        noScore: "{rsn} has never killed Callisto.", singleScore: "{rsn} has killed Callisto once!", display: "{rsn} has killed Callisto **{kc}** times!"},
    {boss: "cerberus", match: ["cerberus", "cerb"], name: "Cerberus", 
        noScore: "{rsn} has never killed Cerberus", singleScore: "{rsn} has killed Cerberus once!", display: "{rsn} has killed Cerberus **{kc}** times!"},
    {boss: "chambersOfXeric", match: ["chambers", "chambers_of_xeric", "chamber_of_xeric", "cox"], name: "Chambers of Xeric",
        noScore: "{rsn} has never completed a Chambers of Xeric raid.", singleScore: "{rsn} has completed a single Chambers of Xeric raid.", 
        display: "{rsn} has completed **{kc}** Chambers of Xeric raids!"},
    {boss: "chambersOfXericChallenge", match: ["chambers_challenge", "chambers_challenge_mode", "cox_challenge", "cox_challenge_mode", "cox_cm"], name: "Chambers of Xeric (Challenge Mode)",
        noScore: "{rsn} has never completed a _Challenge Mode_ Chambers of Xeric raid.", singleScore: "{rsn} has completed a single _Challenge Mode_ Chambers of Xeric raid!",
        display: "{rsn} has completed **{kc}** _Challenge Mode_ Chambers of Xeric raids!"},
    {boss: "chaosElemental", match: ["chaos_elemental", "elemental", "ele"], name: "Chaos Elemental",
        noScore: "{rsn} has never killed the Chaos Elemental.", singleScore: "{rsn} has killed the Chaos Elemental once!", display: "{rsn} has killed the Chaos Elemental **{kc}** times!"},
    {boss: "chaosFanatic", match: ["chaos_fanatic", "fanatic", "fan"], name: "Chaos Fanatic",
        noScore: "{rsn} has never killed the Chaos Fanatic.", singleScore: "{rsn} has killed the Chaos Fanatic once!", display: "{rsn} has killed the Chaos Fanatic **{kc}** times!"},
    {boss: "commanderZilyana", match: ["zilyana", "commander_zilyana", "saradomin", "sara"], name: "Commander Zilyana",
        noScore: "{rsn} has never killed Commander Zilyana.", singleScore: "{rsn} has killed Commander Zilyana once!", display: "{rsn} has killed Commander Zilyana **{kc}** times!"},
    {boss: "corporealBeast", match: ["corporeal_beast", "corp"], name: "Corporeal Beast",
        noScore: "{rsn} has never killed the Corporeal Beast.", singleScore: "{rsn} has killed the Corporeal Beast once!", display: "{rsn} has killed the Corporeal Beast **{kc}** times!"},
    {boss: "crazyArchaeologist", match: ["crazy_archaeologist", "crazy_arch"], name: "Crazy Archaeologist",
        noScore: "{rsn} has never killed the Crazy Archaeologist.", singleScore: "{rsn} has killed the Crazy Archaeologist once!", display: "{rsn} has killed the Crazy Archaeologist **{kc}** times!"},
    {boss: "dagannothPrime", match: ["dagannoth_prime", "prime"], name: "Dagannoth Prime",
        noScore: "{rsn} has never killed Dagannoth Prime.", singleScore: "{rsn} has killed Dagannoth Prime once!", display: "{rsn} has killed Dagannoth Prime **{kc}** times!"},
    {boss: "dagannothRex", match: ["dagannoth_rex", "rex"], name: "Dagannoth Rex",
        noScore: "{rsn} has never killed Dagannoth Rex.", singleScore: "{rsn} has killed Dagannoth Rex once!", display: "{rsn} has killed Dagannoth Rex **{kc}** times!"},
    {boss: "dagannothSupreme", match: ["dagannoth_supreme", "supreme"], name: "Dagannoth Supreme",
        noScore: "{rsn} has never killed Dagannoth Supreme.", singleScore: "{rsn} has killed Dagannoth Supreme once!", display: "{rsn} has killed Dagannoth Supreme **{kc}** times!"},
    {boss: "derangedArchaeologist", match: ["deranged_archaeologist", "deranged_arch"], name: "Deranged Archaeologist",
        noScore: "{rsn} has never killed the Deranged Archaeologist.", singleScore: "{rsn} has killed the Deranged Archaeologist once!", display: "{rsn} has killed the Deranged Archaeologist **{kc}** times!"},
    {boss: "generalGraardor", match: ["general_graardor", "graardor", "bandos"], name: "General Graardor",
        noScore: "{rsn} has never killed General Graardor.", singleScore: "{rsn} has killed General Graardor once!", display: "{rsn} has killed General Graardor **{kc}** times!"},
    {boss: "giantMole", match: ["giant_mole", "mole"], name: "Giant Mole",
        noScore: "{rsn} has never killed the Giant Mole.", singleScore: "{rsn} has killed the Giant Mole once!", display: "{rsn} has killed the Giant Mole **{kc}** times!"},
    {boss: "grotesqueGuardians", match: ["grotesque_guardians", "grotesque", "guardians"], name: "Grotesque Guardians",
        noScore: "{rsn} has never killed the Grotesque Guardians.", singleScore: "{rsn} has killed the Grotesque Guardians once!", display: "{rsn} has killed the Grotesque Guardians **{kc}** times!"},
    {boss: "hespori", match: ["hespori"], name: "Hespori",
        noScore: "{rsn} has never harvested the Hespori.", singleScore: "{rsn} has harvested the Hespori once!", display: "{rsn} has harvested the Hespori **{kc}** times!"},
    {boss: "kalphiteQueen", match: ["kalphite_queen", "kalphite", "queen", "kq"], name: "Kalphite Queen",
        noScore: "{rsn} has never killed the Kalphite Queen.", singleScore: "{rsn} has killed the Kalphite Queen once!", display: "{rsn} has killed the Kalphite Queen **{kc}** times!"},
    {boss: "kingBlackDragon", match: ["king_black_dragon", "king", "kbd"], name: "King Black Dragon",
        noScore: "{rsn} has never killed the King Black Dragon.", singleScore: "{rsn} has killed the King Black Dragon once!", display: "{rsn} has killed the King Black Dragon **{kc}** times!"},
    {boss: "kraken", match: ["kraken"], name: "Kraken",
        noScore: "{rsn} has never killed the Kraken.", singleScore: "{rsn} has killed the Kraken once!", display: "{rsn} has killed the Kraken **{kc}** times!"},
    {boss: "kreeArra", match: ["kree", "kree_arra", "kree'arra", "armadyl", "arma"], name: "Kree'arra",
        noScore: "{rsn} has never killed Kree'arra.", singleScore: "{rsn} has killed Kree'arra once!", display: "{rsn} has killed Kree'arra **{kc}** times!"},
    {boss: "krilTsutsaroth", match: ["kril", "kril_tsutsaroth", "k'ril_tsutsaroth", "zamorak", "zammy"], name: "K'ril Tsutsaroth",
        noScore: "{rsn} has never killed K'ril Tsutsaroth.", singleScore: "{rsn} has killed K'ril Tsutsaroth once!", display: "{rsn} has killed K'ril Tsutsaroth **{kc}** times!"},
    {boss: "mimic", match: ["mimic", "casket", "chest"], name: "Mimic",
        noScore: "{rsn} has never defeated the Mimic.", singleScore: "{rsn} has defeated the Mimic once!", display: "{rsn} has defeated the Mimic **{kc}** times!"},
    {boss: "obor", match: ["obor"], name: "Obor",
        noScore: "{rsn} has never killed Obor.", singleScore: "{rsn} has killed Obor once!", display: "{rsn} has killed Obor **{kc}** times!"},
    {boss: "sarachnis", match: ["sarachnis", "spooder"], name: "Sarachnis",
        noScore: "{rsn} has never killed Sarachnis.", singleScore: "{rsn} has killed Sarachnis once!", display: "{rsn} has killed Sarachnis **{kc}** times!"},
    {boss: "scorpia", match: ["scorp", "scorpia"], name: "Scorpia",
        noScore: "{rsn} has never killed Scorpia.", singleScore: "{rsn} has killed Scorpia once!", display: "{rsn} has killed Scorpia **{kc}** times!"},
    {boss: "skotizo", match: ["skot", "skotizo"], name: "Skotizo",
        noScore: "{rsn} has never killed Skotizo.", singleScore: "{rsn} has killed Skotizo once!", display: "{rsn} has killed Skotizo **{kc}** times!"},
    {boss: "gauntlet", match: ["the_gauntlet", "gauntlet"], name: "The Gauntlet",
        noScore: "{rsn} has never completed the Gauntlet.", singleScore: "{rsn} has completed the Gauntlet once!", display: "{rsn} has completed the Gauntlet **{kc}** times!"},
    {boss: "corruptedGauntlet", match: ["the_corrupted_gauntlet", "corrupted_gauntlet"], name: "The Corrupted Gauntlet",
        noScore: "{rsn} has never completed the Corrupted Gauntlet.", singleScore: "{rsn} has completed the Corrupted Gauntlet once!", display: "{rsn} has completed the Corrupted Gauntlet **{kc}** times!"},
    {boss: "theatreOfBlood", match: ["theatre_of_blood", "theater_of_blood", "tob", "swampletics"], name: "Theatre of Blood",
        noScore: "{rsn} has never completed a Theatre of Blood raid.", singleScore: "{rsn} has completed a single Theatre of Blood raid!", display: "{rsn} has completed **{kc}** Theatre of Blood raids!"},
    {boss: "thermoSmokeDevil", match: ["thermy", "thermo", "thermonuclear", "thermonuclear_smoke_devil", "smoke_devil"], name: "Thermonuclear Smoke Devil",
        noScore: "{rsn} has never killed the Thermonuclear Smoke Devil.", singleScore: "{rsn} has killed the Thermonuclear Smoke Devil once!", display: "{rsn} has killed the Thermonuclear Smoke Devil **{kc}** times!"},
    {boss: "zuk", match: ["zuk", "infernal", "inferno"], name: "TzKal-Zuk",
        noScore: "{rsn} has never completed the Inferno.", singleScore: "{rsn} has defeated TzKal-Zuk and completed the Inferno once!", display: "{rsn} has defeated TzKal-Zuk and completed the Inferno **{kc}** times!"},
    {boss: "jad", match: ["jad", "fire", "fire_cape", "xzact"], name: "TzTok-Jad",
        noScore: "{rsn} has never completed the Fight Cave.", singleScore: "{rsn} has defeated TzTok-Jad and completed the Fight Cave once!", display: "{rsn} has defeated TzTok-Jad and completed the Fight Cave **{kc}** times!"},
    {boss: "venenatis", match: ["vene", "venenatis"], name: "Venenatis",
        noScore: "{rsn} has never killed Venenatis.", singleScore: "{rsn} has killed Venenatis once!", display: "{rsn} has killed Venenatis **{kc}** times!"},
    {boss: "vetion", match: ["vetion", "vet'ion"], name: "Vet'ion",
        noScore: "{rsn} has never killed Vet'ion.", singleScore: "{rsn} has killed Vet'ion once!", display: "{rsn} has killed Vet'ion **{kc}** times!"},
    {boss: "vorkath", match: ["vork", "vorkath", "vorki", "money_dragon"], name: "Vorkath",
        noScore: "{rsn} has never slain the almighty Vorkath.", singleScore: "{rsn} has slain the almight Vorkath once!", display: "{rsn} has slain the almighty Vorkath **{kc}** times!"},
    {boss: "wintertodt", match: ["wt", "todt", "wintertodt", "y_fletch"], name: "Wintertodt",
        noScore: "{rsn} has never subdued the Wintertodt.", singleScore: "{rsn} has subdued the Wintertodt once!", display: "{rsn} has subdued the Wintertodt **{kc}** times!"},
    {boss: "zalcano", match: ["zalcano", "zalc"], name: "Zalcano",
        noScore: "{rsn} has never killed Zalcano.", singleScore: "{rsn} has killed Zalcano once!", display: "{rsn} has killed Zalcano **{kc}** times!"},
    {boss: "zulrah", match: ["zul", "zulrah", "money_snake", "money_snek"], name: "Zulrah",
        noScore: "{rsn} has never killed Zulrah.", singleScore: "{rsn} has killed Zulrah once!", display: "{rsn} has killed Zulrah **{kc}** times!"}
];

@singleton()
export class StatsService {
    private statsBg: Canvas.Image;

    constructor(private memberHandler: MemberHandler, 
        private osrsHandler: OsrsHandler,
        private logger: Logger) {}

    startup(registerCallback: (trigger: string, 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback("stats", (msg, args) => this.getPlayerStats(msg, args), CommandType.Public, (msg) => Guard.isBotChannelOrMod(msg));
        registerCallback("kc", (msg, args) => this.bossRecord(msg, args), CommandType.Public, (msg) => Guard.isBotChannelOrMod(msg));

        Canvas.loadImage("./statsbg.png").then((img) => {
            this.statsBg = img;
        });

        this.logger.info("Registered 1 command.", MOD);
    }

    private bossRecord(msg: Discord.Message, args: string[]): void {
        var rsPlayer = this.memberHandler.getById(msg.author.id);

        if (!rsPlayer) {
            msg.reply("you need to register your RSN with me before you can use this command. Try `&register <rsn>`.");
            return;
        }

        var bossSearch = args.join("_").toLowerCase();

        var mappedBoss = bossMap.find((obj) => obj.match.indexOf(bossSearch) > -1);

        if (!mappedBoss) {
            msg.reply("I couldn't figure out which boss you meant. Please try again.");
            return;
        }

        this.osrsHandler.getPlayer(rsPlayer.rsn, (player) => {
            if (!player) {
                msg.reply("I can't find that RSN on the OSRS Hiscores.");
                return;
            }

            var boss = player.bosses[mappedBoss.boss];

            if (!boss || !boss.score || boss.score < 1) {
                msg.channel.send(mappedBoss.noScore.replace("{rsn}", Formatter.formatRSN(rsPlayer.rsn)));
                return;
            }

            if (boss.score === 1) {
                msg.channel.send(mappedBoss.singleScore.replace("{rsn}", Formatter.formatRSN(rsPlayer.rsn)));
                return;
            }

            msg.channel.send(mappedBoss.display.replace("{rsn}", Formatter.formatRSN(rsPlayer.rsn)).replace("{kc}", boss.score.toLocaleString()));
        });
    }

    private getPlayerStats(msg: Discord.Message, args: string[]): void {
        var search: any;

        var player = this.memberHandler.getById(msg.author.id);

        search = player;

        if (args && args.length > 0) search = args.join("_");

        if (search === player) {
            if (!player) {
                msg.reply("you need to register your RSN with me before you can use this command without providing an RSN. Try `&register <rsn>` first, or use `&stats <rsn>`.");
                return;
            }

            search = player.rsn;
        }

        if (search.toLowerCase() === 'swampletics') {
            msg.reply("no spoilers pls 😡😡😡");
            return;
        }

        this.osrsHandler.getPlayer(search, (player) => {
            if (!player) {
                msg.reply("I can't find that RSN on the OSRS Hiscores.");
                return;
            }

            Canvas.registerFont("./runescape_uf.ttf", { family: "Runescape" });
            var canvas = Canvas.createCanvas(204, 275);
            var ctx = canvas.getContext('2d');
            ctx.font = '16px "Runescape"';
            ctx.fillStyle = 'rgb(255, 255, 0)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowColor = 'rgb(0, 0, 0)';

            ctx.drawImage(this.statsBg, 0, 0);

            var overallLevel = 0;
            Object.keys(player.skills).forEach((key) => {
                if (key === "overall") return;

                var level = (key === "hitpoints") ? 10 : 1;

                var line: OsrsSkill = player.skills[key];
                if (line) level = line.level;
                if (level < 1) level = (key === "hitpoints") ? 10 : 1;

                var offset = 0;
                if (level < 10) offset = 4;

                overallLevel += level;

                var posMap = positionMap[key];
                ctx.fillText(level.toLocaleString(), posMap[0] + offset, posMap[1]);
                ctx.fillText(level.toLocaleString(), posMap[0] + 13 + offset, posMap[1] + 13);
            });

            ctx.textAlign = "center";
            if (player.skills.overall && player.skills.overall.level) overallLevel = player.skills.overall.level;

            ctx.fillText(overallLevel.toString(), 165, 258);

            var stream = canvas.createPNGStream();
            msg.channel.send(`Stats for ${Formatter.formatRSN(search)}:`, new Discord.Attachment(stream));
        });
    }
}