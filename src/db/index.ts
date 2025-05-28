import { drizzle } from "drizzle-orm/libsql";

export default drizzle(Bun.env.DB);
