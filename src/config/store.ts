import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { ConfigSchema } from "./schema.js";
import type { Config } from "../types/index.js";

const EMPTY_CONFIG: Config = { default: null, configs: {} };

export async function readConfig(path: string): Promise<Config> {
  if (!existsSync(path)) return structuredClone(EMPTY_CONFIG);
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw);
  return ConfigSchema.parse(parsed) as Config;
}

export async function writeConfig(path: string, config: Config): Promise<void> {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2), "utf-8");
}
