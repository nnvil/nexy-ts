import { Discord, On, type ArgsOf } from "discordx";
import { snipeObject } from "..";

@Discord()
export class MessageEvents {
	@On({ event: "messageDelete" })
	async messageDelete([msg]: ArgsOf<"messageDelete">) {
		snipeObject.author = msg.author?.username ?? "unknown";
		snipeObject.content = msg.content;
	}

	@On({ event: "messageCreate" })
	async messageCreate([msg]: ArgsOf<"messageCreate">) {
		if (msg.author.id == msg.client.user.id) return;

		if (msg.embeds.length > 0) {
			if (msg.embeds[0].description?.includes("Bump done!")) {
				await msg.channel.send("thanks for bumping <3");
			}
		}
	}
}
