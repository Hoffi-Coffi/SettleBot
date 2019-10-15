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

export interface OsrsSkill {
    rank: number,
    level: number,
    exp: number
};

export interface OsrsPlayer {
    overall: OsrsSkill,
    attack: OsrsSkill,
    defence: OsrsSkill,
    strength: OsrsSkill,
    hitpoints: OsrsSkill,
    ranged: OsrsSkill,
    prayer: OsrsSkill,
    magic: OsrsSkill,
    cooking: OsrsSkill,
    woodcutting: OsrsSkill,
    fletching: OsrsSkill,
    fishing: OsrsSkill,
    firemaking: OsrsSkill,
    crafting: OsrsSkill,
    smithing: OsrsSkill,
    mining: OsrsSkill,
    herblore: OsrsSkill,
    agility: OsrsSkill,
    thieving: OsrsSkill,
    slayer: OsrsSkill,
    farming: OsrsSkill,
    runecraft: OsrsSkill,
    hunter: OsrsSkill,
    construction: OsrsSkill
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