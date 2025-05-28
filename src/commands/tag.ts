import {
    ApplicationCommandOptionType,
    MessageFlags,
    PermissionFlagsBits,
    type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { and, eq } from "drizzle-orm";
import db from "../db";
import { tagsTable } from "../db/schema";

@Discord()
@SlashGroup({ name: "tag", description: "zarządzanie tagami" })
@SlashGroup("tag")
export class TagCommands {
    @Slash({ name: "view", description: "wyświetl zawartość taga" })
    async getTag(
        @SlashOption({
            name: "nazwa",
            description: "nazwa tagu",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        inter: CommandInteraction
    ) {
        if (!inter.guildId) return;

        const tag = await db
            .select()
            .from(tagsTable)
            .where(
                and(
                    eq(tagsTable.guild, inter.guildId),
                    eq(tagsTable.name, name)
                )
            )
            .limit(1);

        if (tag.length === 0) {
            return await inter.reply({
                content: `❌ Nie znaleziono tagu o nazwie **\`${name}\`**.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const parsed = tag[0].content.replace(/\\n/g, "\n");

        await inter.reply(parsed);
    }

    @Slash({ name: "manage", description: "stwórz lub zaktualizuj tag" })
    async createTag(
        @SlashOption({
            name: "nazwa",
            description: "nazwa tagu",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        @SlashOption({
            name: "treść",
            description: "treść taga (\\n = nowa linia)",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        content: string,
        inter: CommandInteraction
    ) {
        if (!inter.guildId) return;

        const existing = await db
            .select()
            .from(tagsTable)
            .where(
                and(
                    eq(tagsTable.guild, inter.guildId),
                    eq(tagsTable.name, name)
                )
            )
            .limit(1);

        const isAdmin = inter.memberPermissions?.has(
            PermissionFlagsBits.Administrator
        );
        const userId = inter.user.id;

        let action = "utworzono";

        if (existing.length > 0) {
            const tag = existing[0];

            if (tag.author !== userId && !isAdmin) {
                return await inter.reply({
                    content:
                        "Hola hola, nie masz uprawnień do edycji tego tagu.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            await db
                .update(tagsTable)
                .set({ content })
                .where(
                    and(
                        eq(tagsTable.guild, inter.guildId),
                        eq(tagsTable.name, name)
                    )
                );

            action = "zaktualizowano";
        } else {
            await db.insert(tagsTable).values({
                guild: inter.guildId,
                name,
                content,
                author: userId,
            });
        }

        await inter.reply({
            content: `✅ Tag **\`${name}\`** ${action}.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    @Slash({ name: "delete", description: "usuń istniejący tag" })
    async deleteTag(
        @SlashOption({
            name: "nazwa",
            description: "nazwa tagu",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        inter: CommandInteraction
    ) {
        if (!inter.guildId) return;

        const existing = await db
            .select()
            .from(tagsTable)
            .where(
                and(
                    eq(tagsTable.guild, inter.guildId),
                    eq(tagsTable.name, name)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return await inter.reply({
                content: "Ojoj, nie znaleziono takiego tagu.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const tag = existing[0];
        const isAdmin = inter.memberPermissions?.has(
            PermissionFlagsBits.Administrator
        );
        const userId = inter.user.id;

        if (tag.author !== userId && !isAdmin) {
            return await inter.reply({
                content:
                    "Hola hola, nie masz uprawnień do usunięcia tego tagu.",
                flags: MessageFlags.Ephemeral,
            });
        }

        await db
            .delete(tagsTable)
            .where(
                and(
                    eq(tagsTable.guild, inter.guildId),
                    eq(tagsTable.name, name)
                )
            );

        await inter.reply({
            content: `🗑️ Usunięto tag **\`${name}\`**.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    @Slash({ name: "list", description: "wyświetl wszystkie tagi" })
    async listTags(inter: CommandInteraction) {
        if (!inter.guildId) return;

        const tags = await db
            .select()
            .from(tagsTable)
            .where(eq(tagsTable.guild, inter.guildId));

        if (tags.length === 0) {
            return await inter.reply({
                content: "Na tym serwerze nie ma jeszcze żadnych tagów.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const tagList = tags.map((t) => `• \`${t.name}\``).join("\n");

        await inter.reply({
            content: `**Dostępne tagi:**\n${tagList}`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
