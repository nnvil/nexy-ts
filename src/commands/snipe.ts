import { type CommandInteraction, MessageFlags } from "discord.js";
import { Discord, Slash } from "discordx";
import { snipeObject } from "..";

@Discord()
export class SnipeCmd {
    @Slash({
        name: "snipe",
        description: "wyświetl ostatnio usuniętą wiadomość",
    })
    async snipe(inter: CommandInteraction) {
        if (!snipeObject || (!snipeObject.author && !snipeObject.content)) {
            return await inter.reply({
                content: "nie znaleziono wiadomości w cache.",
                flags: MessageFlags.Ephemeral,
            });
        }
        await inter.reply(`${snipeObject.author} said: ${snipeObject.content}`);
    }
}
