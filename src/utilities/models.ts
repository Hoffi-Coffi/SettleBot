export enum CommandType {
    Public, Private, All
};

export interface IEvent {
    name: string;
    date: string;
};

export interface Member {
    rsn: string,
    user: string,
    id: string
};

export interface PollVote {
    discordId: string,
    votedFor: string
};

export interface Poll {
    options: string[],
    votes: PollVote[],
    pollMsgId?: string
};

export interface PollResult {
    skill: string,
    votes: number
};

export interface PollResults {
    totalVotes: number,
    results: PollResult[]
};

export interface Skills {
    uncompeted: string[],
    competed: string[]
};

export interface LeaderboardMember {
    discordId: string,
    score: number
};

export interface Leaderboard {
    type: string,
    scores: LeaderboardMember[]
};

export interface IMetric {
    name: Metric;
    count: number;
}

export enum Metric {
    MessagesSeen = "messagesseen",
    WordsScanned = "wordsscanned",
    BadWordsFound = "badwordsfound",
    DeletedMessages = "deletedmessages",
    MembersMutedAuto = "membersmutedauto",
    MembersMutedManual = "membersmutedmanual"
};

export class OsrsSkill {
    rank: number;
    level: number;
    exp: number;
};

export class OsrsPlayer {
    skills: OsrsPlayerSkills = new OsrsPlayerSkills();
    minigames: OsrsMinigames = new OsrsMinigames();
    clues: OsrsClues = new OsrsClues();
    bosses: OsrsBossRecords = new OsrsBossRecords();
};

export class OsrsScore {
    rank: number;
    score: number
};

export class OsrsMinigames {
    bounty: OsrsScore = new OsrsScore();
    bountyRogue: OsrsScore = new OsrsScore();
    lastManStanding: OsrsScore = new OsrsScore();
};

export class OsrsClues {
    all: OsrsScore = new OsrsScore();
    beginner: OsrsScore = new OsrsScore();
    easy: OsrsScore = new OsrsScore();
    medium: OsrsScore = new OsrsScore();
    hard: OsrsScore = new OsrsScore();
    elite: OsrsScore = new OsrsScore();
    master: OsrsScore = new OsrsScore();
};

export class OsrsPlayerSkills {
    overall: OsrsSkill = new OsrsSkill();
    attack: OsrsSkill = new OsrsSkill();
    defence: OsrsSkill = new OsrsSkill();
    strength: OsrsSkill = new OsrsSkill();
    hitpoints: OsrsSkill = new OsrsSkill();
    ranged: OsrsSkill = new OsrsSkill();
    prayer: OsrsSkill = new OsrsSkill();
    magic: OsrsSkill = new OsrsSkill();
    cooking: OsrsSkill = new OsrsSkill();
    woodcutting: OsrsSkill = new OsrsSkill();
    fletching: OsrsSkill = new OsrsSkill();
    fishing: OsrsSkill = new OsrsSkill();
    firemaking: OsrsSkill = new OsrsSkill();
    crafting: OsrsSkill = new OsrsSkill();
    smithing: OsrsSkill = new OsrsSkill();
    mining: OsrsSkill = new OsrsSkill();
    herblore: OsrsSkill = new OsrsSkill();
    agility: OsrsSkill = new OsrsSkill();
    thieving: OsrsSkill = new OsrsSkill();
    slayer: OsrsSkill = new OsrsSkill();
    farming: OsrsSkill = new OsrsSkill();
    runecraft: OsrsSkill = new OsrsSkill();
    hunter: OsrsSkill = new OsrsSkill();
    construction: OsrsSkill = new OsrsSkill();
};

export class OsrsBossRecords {
    abyssalSire: OsrsScore = new OsrsScore();
    alchemicalHydra: OsrsScore = new OsrsScore();
    barrowsChests: OsrsScore = new OsrsScore();
    bryophyta: OsrsScore = new OsrsScore();
    callisto: OsrsScore = new OsrsScore();
    cerberus: OsrsScore = new OsrsScore();
    chambersOfXeric: OsrsScore = new OsrsScore();
    chambersOfXericChallenge: OsrsScore = new OsrsScore();
    chaosElemental: OsrsScore = new OsrsScore();
    chaosFanatic: OsrsScore = new OsrsScore();
    commanderZilyana: OsrsScore = new OsrsScore();
    corporealBeast: OsrsScore = new OsrsScore();
    crazyArchaeologist: OsrsScore = new OsrsScore();
    dagannothPrime: OsrsScore = new OsrsScore();
    dagannothRex: OsrsScore = new OsrsScore();
    dagannothSupreme: OsrsScore = new OsrsScore();
    derangedArchaeologist: OsrsScore = new OsrsScore();
    generalGraardor: OsrsScore = new OsrsScore();
    giantMole: OsrsScore = new OsrsScore();
    grotesqueGuardians: OsrsScore = new OsrsScore();
    hespori: OsrsScore = new OsrsScore();
    kalphiteQueen: OsrsScore = new OsrsScore();
    kingBlackDragon: OsrsScore = new OsrsScore();
    kraken: OsrsScore = new OsrsScore();
    kreeArra: OsrsScore = new OsrsScore();
    krilTsutsaroth: OsrsScore = new OsrsScore();
    mimic: OsrsScore = new OsrsScore();
    obor: OsrsScore = new OsrsScore();
    sarachnis: OsrsScore = new OsrsScore();
    scorpia: OsrsScore = new OsrsScore();
    skotizo: OsrsScore = new OsrsScore();
    gauntlet: OsrsScore = new OsrsScore();
    corruptedGauntlet: OsrsScore = new OsrsScore();
    theatreOfBlood: OsrsScore = new OsrsScore();
    thermoSmokeDevil: OsrsScore = new OsrsScore();
    zuk: OsrsScore = new OsrsScore();
    jad: OsrsScore = new OsrsScore();
    venenatis: OsrsScore = new OsrsScore();
    vetion: OsrsScore = new OsrsScore();
    vorkath: OsrsScore = new OsrsScore();
    wintertodt: OsrsScore = new OsrsScore();
    zalcano: OsrsScore = new OsrsScore();
    zulrah: OsrsScore = new OsrsScore();
};

export interface Competitor {
    rsn: string,
    startExp: number,
    endExp: number
};

export interface Competition {
    skill: string,
    type: string,
    dateStart: string,
    dateEnd: string,
    competitors: Competitor[]
};

export const BossMap = [
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