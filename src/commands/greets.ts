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
	description: "config greet messages",
})
@SlashGroup("greet")
export class GreetCmds {
	@Slash({ name: "join", description: "set welcome message" })
	async helloSetup(
		@SlashOption({
			name: "channel",
			description: "channel to send the message",
			required: true,
			type: ApplicationCommandOptionType.Channel,
		})
		channel: TextChannel,
		@SlashOption({
			name: "message",
			description: "welcome message (\\n = new line)",
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
			content: "✅ welcome message set!",
			flags: MessageFlags.Ephemeral,
		});
	}

	@Slash({ name: "leave", description: "set leave message" })
	async byeSetup(
		@SlashOption({
			name: "channel",
			description: "channel to send the message",
			required: true,
			type: ApplicationCommandOptionType.Channel,
		})
		channel: TextChannel,
		@SlashOption({
			name: "message",
			description: "leave message (\\n = new line)",
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
			content: "✅ leave message set!",
			flags: MessageFlags.Ephemeral,
		});
	}
}
