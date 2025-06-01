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
@SlashGroup({ name: "tag", description: "manage tags" })
@SlashGroup("tag")
export class TagCommands {
	@Slash({ name: "view", description: "view tag content" })
	async getTag(
		@SlashOption({
			name: "name",
			description: "tag name",
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
				content: `❌ Tag **\`${name}\`** not found.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		const parsed = tag[0].content.replace(/\\n/g, "\n");

		await inter.reply(parsed);
	}

	@Slash({ name: "manage", description: "create or update tag" })
	async createTag(
		@SlashOption({
			name: "name",
			description: "tag name",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		name: string,
		@SlashOption({
			name: "content",
			description: "tag content (\\n = new line)",
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

		let action = "created";

		if (existing.length > 0) {
			const tag = existing[0];

			if (tag.author !== userId && !isAdmin) {
				return await inter.reply({
					content:
						"Yo yo, don't touch something that doesn't belong to you.",
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

			action = "updated";
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

	@Slash({ name: "delete", description: "delete tag" })
	async deleteTag(
		@SlashOption({
			name: "name",
			description: "tag name",
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
				content: "Oopsie, can't find that.",
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
					"Yo yo, don't touch something that doesn't belong to you.",
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
			content: `🗑️ Deleted **\`${name}\`** tag.`,
			flags: MessageFlags.Ephemeral,
		});
	}

	@Slash({ name: "list", description: "view all tags" })
	async listTags(inter: CommandInteraction) {
		if (!inter.guildId) return;

		const tags = await db
			.select()
			.from(tagsTable)
			.where(eq(tagsTable.guild, inter.guildId));

		if (tags.length === 0) {
			return await inter.reply({
				content: "This server has no tags yet.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const tagList = tags.map((t) => `• \`${t.name}\``).join("\n");

		await inter.reply({
			content: `**Available tags:**\n${tagList}`,
			flags: MessageFlags.Ephemeral,
		});
	}
}
