import { Client, Discord, On, type ArgsOf } from "discordx";
import { ignoredUsers } from "../index";

@Discord()
export class Ready {
    @On({ event: "ready" })
    async readyEvent([_]: ArgsOf<"ready">, client: Client) {
        console.log(`${client.user?.displayName} is online.`);

        await client.initApplicationCommands();
        await client.guilds.fetch();

        const members = client.guilds.cache.get(Bun.env.GUILD!)?.members;

        if (members) {
            while (true) {
                const sleep = (t: number) =>
                    new Promise((r) => setTimeout(r, t));

                const badMems = members.cache.filter(
                    (m) =>
                        !ignoredUsers.includes(m.id) &&
                        m.roles.cache.get(Bun.env.UNDERAGE_ROLE!) != undefined
                );
                badMems.forEach((m) => m.ban({ reason: "underage" }).then());
                await sleep(180000);
            }
        }
    }
}
