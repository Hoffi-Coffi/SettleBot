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

export interface SotwCompetitor {
    rsn: string,
    startExp: number,
    endExp: number
};

export interface SotwCompetition {
    skill: string,
    dateStart: string,
    dateEnd: string,
    competitors: SotwCompetitor[]
};