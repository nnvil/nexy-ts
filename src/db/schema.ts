import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const joinTable = sqliteTable("join", {
    guild: text().primaryKey().notNull(),
    channel: text().notNull(),
    message: text().notNull(),
});

export const leaveTable = sqliteTable("leave", {
    guild: text().primaryKey().notNull(),
    channel: text().notNull(),
    message: text().notNull(),
});

export const tagsTable = sqliteTable("tags", {
    guild: text().primaryKey(),
    name: text().notNull(),
    content: text().notNull(),
    author: text().notNull(),
});
