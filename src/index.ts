import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";

const fs = require("fs");
const toml = require("toml");

interface Config {
    ignored_users: {
        ids: string[];
    };
}

const config: Config = toml.parse(fs.readFileSync("config.toml", "utf-8"));

export const ignoredUsers = config.ignored_users.ids;

interface Snipe {
    content: string | null;
    author: string | undefined;
}

export let snipeObject: Snipe = { content: null, author: undefined };

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.DirectMessages,
    ],
    silent: false,
});

client.on("error", console.error);

const run = async () => {
    await importx(
        `${dirname(import.meta.url)}/{events,commands,components}/**/*.ts`
    );
    client.login(Bun.env.TOKEN!);
};

run();
