import { type CommandInteraction, MessageFlags } from "discord.js";
import { Discord, Slash } from "discordx";
import { snipeObject } from "..";

@Discord()
export class SnipeCmd {
	@Slash({
		name: "snipe",
		description: "display the last deleted message",
	})
	async snipe(inter: CommandInteraction) {
		if (!snipeObject || (!snipeObject.author && !snipeObject.content)) {
			return await inter.reply({
				content: "no messages found in cache.",
				flags: MessageFlags.Ephemeral,
			});
		}
		await inter.reply(
			`**${snipeObject.author.id}** said: ${snipeObject.content}`
		);
	}
}
