import { singleton } from "tsyringe";
import { Poll, PollVote } from "../utilities/models";
import { Logger } from "../utilities/logger";
import * as fs from "fs";

const MOD = "pollHandler.ts";

@singleton()
export class PollHandler {
    private poll: Poll;

    constructor(private logger: Logger) {
        this.loadPoll();
    }

    private loadPoll(): void {
        this.poll = null;

        fs.readFile("./poll.json", (err, data) => {
            if (err) {
                this.logger.error(`Failed to read poll: ${err}`, MOD);
                return;
            }

            this.poll = JSON.parse(data.toString());

            if (!this.poll) {
                this.logger.warn("Couldn't find a poll.", MOD);
                return;
            }

            this.logger.info("Poll loaded", MOD);
        });
    }

    addOrUpdatePollVote(vote: PollVote): void {
        var search = this.poll.votes.find((obj) => obj.discordId === vote.discordId);

        if (search) this.poll.votes.splice(this.poll.votes.indexOf(search), 1);

        this.poll.votes.push(vote);

        this.savePoll();
    }

    startNewPoll(newPoll: Poll): void {
        this.poll = newPoll;

        this.savePoll();
    }

    clearPoll(): void {
        this.poll = null;

        this.savePoll();
    }

    getPoll(): Poll {
        return this.poll;
    }

    private savePoll(): void {
        fs.writeFile("./poll.json", JSON.stringify(this.poll), (err) => {
            if (err) this.logger.error(`Failed to save poll: ${err}`, MOD);
        });
    }
}