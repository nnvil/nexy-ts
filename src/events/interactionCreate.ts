import { Client, Discord, On, type ArgsOf } from "discordx";

@Discord()
export class InteractionCreate {
    @On({ event: "interactionCreate" })
    async interactionCreate(
        [inter]: ArgsOf<"interactionCreate">,
        client: Client
    ) {
        if (!inter.guildId) return;

        await client.executeInteraction(inter);
    }
}
