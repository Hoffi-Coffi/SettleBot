import ServerUtils from "../../src/utilities/serverUtils";
import {GuildMember, Guild, Client, Role} from "discord.js";
jest.mock("discord.js");

describe("ServerUtils", () => {
    describe("addRoleToUser adds role successfully", () => {
        var guild = new Guild(new Client(), jest.fn());
        var memb = new GuildMember(guild, jest.fn());
        var role = new Role(guild, jest.fn());

        ServerUtils.addRoleToUser(memb, role);

        expect(memb.addRole).toHaveBeenCalled();
    })
})