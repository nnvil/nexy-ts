import {
    ApplicationCommandOptionType,
    MessageFlags,
    TextChannel,
    type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { sql } from "drizzle-orm";
import db from "../db";
import { joinTable, leaveTable } from "../db/schema";

@Discord()
@SlashGroup({
    name: "greet",
    description: "konfiguruj wiadomości powitania i pożegnania",
})
@SlashGroup("greet")
export class GreetCmds {
    @Slash({ name: "join", description: "ustaw wiadomość powitalną" })
    async helloSetup(
        @SlashOption({
            name: "channel",
            description: "kanał, na którym wysłać wiadomość",
            required: true,
            type: ApplicationCommandOptionType.Channel,
        })
        channel: TextChannel,
        @SlashOption({
            name: "message",
            description: "wiadomość powitalna (\\n = nowa linia)",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        message: string,
        inter: CommandInteraction
    ) {
        if (!inter.guildId) return;

        if (inter.user.id !== inter.guild?.ownerId) return;

        const parsedMessage = message.replace(/\\n/g, "\n");

        await db
            .insert(joinTable)
            .values({
                guild: inter.guildId,
                channel: channel.id,
                message: parsedMessage,
            })
            .onConflictDoUpdate({
                target: joinTable.guild,
                set: {
                    message: parsedMessage,
                    channel: channel.id,
                },
                setWhere: sql`guild = ${inter.guildId}`,
            });

        await inter.reply({
            content: "✅ wiadomość powitalna ustawiona!",
            flags: MessageFlags.Ephemeral,
        });
    }

    @Slash({ name: "leave", description: "ustaw wiadomość pożegnalną" })
    async byeSetup(
        @SlashOption({
            name: "channel",
            description: "kanał, na którym wysłać wiadomość",
            required: true,
            type: ApplicationCommandOptionType.Channel,
        })
        channel: TextChannel,
        @SlashOption({
            name: "message",
            description: "wiadomość pożegnalna (\\n = nowa linia)",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        message: string,
        inter: CommandInteraction
    ) {
        if (!inter.guildId) return;

        if (inter.user.id !== inter.guild?.ownerId) return;

        const parsedMessage = message.replace(/\\n/g, "\n");

        await db
            .insert(leaveTable)
            .values({
                guild: inter.guildId,
                channel: channel.id,
                message: parsedMessage,
            })
            .onConflictDoUpdate({
                target: leaveTable.guild,
                set: {
                    message: parsedMessage,
                    channel: channel.id,
                },
                setWhere: sql`guild = ${inter.guildId}`,
            });

        await inter.reply({
            content: "✅ wiadomość pożegnalna ustawiona!",
            flags: MessageFlags.Ephemeral,
        });
    }
}
