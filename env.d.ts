module "bun" {
    interface Env {
        TOKEN: string;
        GUILD: string;
        UNDERAGE_ROLE: string;
        BOT_ROLE: string;
        OWNER: string;
        MOD_ROLE: string;
        DB: string;
    }
}
