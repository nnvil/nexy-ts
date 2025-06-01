import type { TextChannel } from "discord.js";
import { Client, Discord, On, type ArgsOf } from "discordx";

import { eq } from "drizzle-orm";
import db from "../db";
import { joinTable, leaveTable } from "../db/schema";

import { ignoredUsers } from "../index";

@Discord()
export class MemberEvents {
	@On({ event: "guildMemberAdd" })
	async memberAdd([member]: ArgsOf<"guildMemberAdd">, client: Client) {
		const greetRes = await db
			.select()
			.from(joinTable)
			.where(eq(joinTable.guild, member.guild.id));
		if (greetRes.length > 0) {
			const channel = client.channels.cache.get(
				greetRes[0].channel
			) as TextChannel;
			await channel.send(
				greetRes[0].message.replace("{user}", `<@${member.user.id}>`)
			);
		}

		if (member.user.bot) {
			const botRole = member.guild.roles.cache.get(Bun.env.BOT_ROLE!);
			if (botRole) {
				await member.roles.add(botRole);
			}
		} else {
			if (
				Date.now() - member.user.createdAt.getTime() <
				1000 * 60 * 60 * 24 * 7
			) {
				try {
					await member.send(
						"To protect against raids, bots, etc., accounts created less than a week ago are removed from the server upon joining. Before rejoining, make sure your account is at least a week old."
					);
				} catch (_) {}
				await member.kick("account less than a week old");
				return;
			}
		}
	}

	@On({ event: "guildMemberRemove" })
	async memberRemove([member]: ArgsOf<"guildMemberRemove">, client: Client) {
		const byeRes = await db
			.select()
			.from(leaveTable)
			.where(eq(leaveTable.guild, member.guild.id));
		if (byeRes.length > 0) {
			const channel = client.channels.cache.get(
				byeRes[0].channel
			) as TextChannel;
			await channel.send(
				byeRes[0].message.replace("{user}", `${member.user.username}`)
			);
		}
	}

	@On({ event: "guildMemberUpdate" })
	async memberUpdate([_, newM]: ArgsOf<"guildMemberUpdate">) {
		if (ignoredUsers.includes(newM.id)) {
			return;
		}

		if (newM.roles.cache.get(Bun.env.UNDERAGE_ROLE!)) {
			await newM.ban({
				reason: "underage",
			});
		}
	}
}
