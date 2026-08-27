import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. This site does not use D1 yet: add a `d1_databases` entry to `localBindingConfig` in vite.config.ts for local dev, and bind the database on the Worker in the Cloudflare dashboard, before calling getDb()."
    );
  }

  return drizzle(env.DB, { schema });
}
