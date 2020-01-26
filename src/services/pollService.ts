import * as Discord from "discord.js";
import { singleton } from "tsyringe";
import { PollHandler } from "../handlers/pollHandler";
import { SkillsHandler } from "../handlers/skillsHandler";
import { Logger } from "../utilities/logger";
import { CommandType, PollResults } from "../utilities/models";
import Guard from "../utilities/guard";

const MOD = "pollService.ts";

const skillMap = [
    {skill: "ranged", match: ["range", "ranged", "ranging"], emoji: "<:ranged:667851300821532724>", snowflake: "667851300821532724"}, 
    {skill: "prayer", match: ["pray", "prayer"], emoji: "<:prayer:667851301228380162>", snowflake: "667851301228380162"}, 
    {skill: "magic", match: ["mage", "magic"], emoji: "<:magic:667851301060870205>", snowflake: "667851301060870205"},
    {skill: "runecraft", match: ["rc", "runecraft", "runecrafting"], emoji: "<:runecraft:667851301236899867>", snowflake: "667851301236899867"}, 
    {skill: "combat", match: ["combat", "cmb"], emoji: "<:combat:667851300821794840>", snowflake: "667851300821794840"}, 
    {skill: "crafting", match: ["craft", "crafting"], emoji: "<:crafting:667851301064933399>", snowflake: "667851301064933399"},
    {skill: "mining", match: ["mine", "mining", "mineing"], emoji: "<:mining:667851301132173312>", snowflake: "667851301132173312"}, 
    {skill: "smithing", match: ["smith", "smithing"], emoji: "<:smithing:667851301194956810>", snowflake: "667851301194956810"}, 
    {skill: "fishing", match: ["fish", "fishing"], emoji: "<:fishing:667851300796628993>", snowflake: "667851300796628993"},
    {skill: "cooking", match: ["cook", "cooking"], emoji: "<:cooking:667851301194825778>", snowflake: "667851301194825778"}, 
    {skill: "firemaking", match: ["fm", "fming", "firemake", "firemaking"], emoji: "<:firemaking:667851301216059432>", snowflake: "667851301216059432"},
    {skill: "woodcutting", match: ["wc", "wcing", "woodcut", "woodcutting"], emoji: "<:woodcutting:667851301199151134>", snowflake: "667851301199151134"}, 
    {skill: "agility", match: ["agi", "agil", "agility"], emoji: "<:agility:667851301203345408>", snowflake: "667851301203345408"},
    {skill: "herblore", match: ["herb", "herblore"], emoji: "<:herblore:667851301119590431>", snowflake: "667851301119590431"},
    {skill: "thieving", match: ["thieve", "thieving", "theive", "theiving"], emoji: "<:thieving:667851301140430888>", snowflake: "667851301140430888"},
    {skill: "fletching", match: ["fletch", "fletching"], emoji: "<:fletching:667851300825989175>", snowflake: "667851300825989175"}, 
    {skill: "slayer", match: ["slay", "slayer"], emoji: "<:slayer:667851300792172547>", snowflake: "667851300792172547"},
    {skill: "farming", match: ["farm", "farming"], emoji: "<:farming:667851301174116353>", snowflake: "667851301174116353"}, 
    {skill: "construction", match: ["con", "cons", "construct", "construction"], emoji: "<:construction:667851301152882727>", snowflake: "667851301152882727"}, 
    {skill: "hunter", match: ["hunt", "hunter"], emoji: "<:hunter:667851301190762506>", snowflake: "667851301190762506"},
    {skill: "overall", match: ["overall", "all"], emoji: "<:overall:667851301186568247>", snowflake: "667851301186568247"}
];

@singleton()
export class PollService {
    private pollMessage: Discord.Message;
    private sotwChannel: Discord.TextChannel;

    constructor(private pollHandler: PollHandler,
        private skillsHandler: SkillsHandler,
        private logger: Logger) {}

    startup(registerCallback: (trigger: string[], 
        action: (msg: Discord.Message, 
            args?: string[]) => void, 
            commandType: CommandType, 
            preReq?: (msg: Discord.Message) 
            => boolean) 
        => void): void {
        registerCallback(["newpoll"], (msg) => this.newPoll(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback(["clearpoll"], (msg) => this.clearPoll(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback(["checkpoll"], (msg) => this.checkPollResults(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback(["publishpoll"], (msg) => this.publishPollResults(msg), CommandType.Private, (msg) => Guard.isAdminPriv(msg));
        registerCallback(["poll"], (msg) => this.poll(msg), CommandType.Public, (msg) => Guard.isChannelOrMod(msg, ["sotw-bot"]));

        this.logger.info("Registered 5 commands.", MOD);
    }

    setup(_pollMessage: Discord.Message, _sotwChannel: Discord.GuildChannel): void {
        this.pollMessage = _pollMessage;
        this.sotwChannel = <Discord.TextChannel>_sotwChannel;

        if (!this.sotwChannel) this.logger.warn("Couldn't find a SOTW channel", MOD);
    }

    handleReactAdd(msgReact: Discord.MessageReaction, user: Discord.User): boolean {
        if (msgReact.message !== this.pollMessage) return false;
        msgReact.remove(user);

        var skillVoted = skillMap.find((skill) => skill.snowflake === msgReact.emoji.id);

        if (!skillVoted) return true;

        if (this.pollHandler.getPoll().options.indexOf(skillVoted.skill) < 0) return true;

        this.pollHandler.addOrUpdatePollVote({
            discordId: user.id,
            votedFor: skillVoted.skill
        });

        return true;
    }

    private poll(msg: Discord.Message): void {
        var poll = this.pollHandler.getPoll();

        if (poll) msg.reply("please check the pinned messages for this week's poll!");
        else msg.reply("there isn't a poll running at the moment.");
    }

    private checkPollResults(msg: Discord.Message): void {
        var res = this.buildPollResults();

        msg.reply(res);
    }

    private publishPollResults(msg: Discord.Message): void {
        var res = this.buildPollResults();

        this.sotwChannel.send(res);
        this.clearPoll(msg);
    }

    private buildPollResults(): string {
        var results = this.calculatePollResults();

        if (!results) return "There's no poll running at the moment.";

        if (results.totalVotes === 0) return "No one has voted on the poll.";

        var pluralWas = (results.totalVotes === 1) ? "was" : "were";
        var pluralVotes = (results.totalVotes === 1) ? "vote" : "votes";
        var res = `**== Poll Results! ==**\nThere ${pluralWas} ${results.totalVotes} ${pluralVotes} in the poll.\nThese are distributed as follows:\n`;
        var sortedResults = results.results.sort((a, b) => b.votes - a.votes);
        
        sortedResults.forEach((sr) => {
            var emoji = skillMap.find((skill) => skill.skill === sr.skill).emoji;
            var plural = (sr.votes === 1) ? "vote" : "votes";
            res += `\n${emoji} **${sr.skill[0].toUpperCase() + sr.skill.substring(1)}**: ${sr.votes} ${plural}.`;
        });

        var topSkill = sortedResults[0];

        // Check for tie
        if (sortedResults.length > 1 && sortedResults[0].votes === sortedResults[1].votes) {
            res += "\nIt's a tie! To break the tie, I will randomly select one of the tied skills:";

            var selection = this.getRandomInt(0, 1);
            topSkill = sortedResults[selection];
        }

        var topEmoji = skillMap.find((skill) => topSkill.skill === skill.skill).emoji;
        res += `\n\nThe winner is ${topEmoji} **${topSkill.skill[0].toUpperCase() + topSkill.skill.substring(1)}**!`;

        return res;
    }

    private calculatePollResults(): PollResults {
        var poll = this.pollHandler.getPoll();

        if (!poll) return null;

        var res: PollResults = {
            results: [],
            totalVotes: poll.votes.length
        };
        poll.votes.forEach((vote) => {
            var search = res.results.find((r) => r.skill === vote.votedFor);
            if (search) {
                res.results.splice(res.results.indexOf(search), 1);
                search.votes++;
                res.results.push(search);
            } else res.results.push({skill: vote.votedFor, votes: 1});
        });

        return res;
    }

    private newPoll(msg: Discord.Message): void {
        var poll = this.pollHandler.getPoll();

        if (poll) {
            msg.reply("There's already a poll running. To start a new poll, you must first clear the poll using `&clearpoll`.");
            return;
        }

        var availableSkills = this.skillsHandler.getSkillOptions();
        var selectedSkills: string[] = [];

        // Select random skills to poll.
        if (availableSkills.length < 4) selectedSkills = availableSkills;
        else {
            var selectedIndexes: number[] = [];

            var idx = 0, limit = 50;
            for (var i = 0; i < 4; i++) {
                limit = 50;
                idx = this.getRandomInt(0, availableSkills.length - 1);
                while (selectedIndexes.find((id) => id === idx && limit > 0)) {
                    idx = this.getRandomInt(0, availableSkills.length - 1);
                    limit--;
                }

                selectedIndexes.push(idx);
            }

            selectedIndexes.forEach((ind) => {
                selectedSkills.push(availableSkills[ind]);
            });
        }

        poll = {
            options: selectedSkills,
            votes: []
        };

        var pollMsg = "**== Skill-Of-The-Week Poll! ==**\n\n";
        pollMsg += "To cast your vote, simply click/tap on the reaction of your chosen skill's icon. I'll remove your reaction, to keep the results hidden, but your vote will be counted.\n";
        pollMsg += "To change your vote, simply click/tap on another reaction, and I'll take care of it.\n\n";
        pollMsg += "The skills on offer this week are:\n";
        var ix = 1;
        selectedSkills.forEach((skill) => {
            var mappedSkill = skillMap.find((mSkill) => mSkill.skill === skill);
            pollMsg += `${mappedSkill.emoji} **${skill[0].toUpperCase() + skill.substring(1)}**`;
            if (ix < selectedSkills.length - 1) pollMsg += ", ";
            else if (ix < selectedSkills.length) pollMsg += " and ";
            else pollMsg += "!";
            ix++;
        });

        this.sotwChannel.send(pollMsg).then((spm) => {
            var sentPollMessage = <Discord.Message>spm;
            poll.pollMsgId = sentPollMessage.id;
            this.pollMessage = sentPollMessage;

            sentPollMessage.pin();
            selectedSkills.forEach((skill) => {
                var mappedSkill = skillMap.find((mSkill) => mSkill.skill === skill);
                sentPollMessage.react(mappedSkill.snowflake);
            });

            this.pollHandler.startNewPoll(poll);
        });

        msg.reply("Done!");
    }

    private clearPoll(msg: Discord.Message): void {
        var poll = this.pollHandler.getPoll();

        if (!poll) {
            msg.reply("There is no poll to clear!");
            return;
        }

        this.pollMessage.unpin().then((pm) => {
            pm.delete();

            this.pollMessage = null;
            this.pollHandler.clearPoll();
        });

        msg.reply("Done!");
    }

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}