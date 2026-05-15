import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { readConfig, writeConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";
import { promptEnvSelection, promptArgs } from "../prompts/env-selector.js";
import envVarsData from "../data/env-vars.json" with { type: "json" };
import type { EnvVar } from "../types/index.js";

export async function newCommand(): Promise<void> {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  const name = await input({
    message: "Profile name (e.g. local, openrouter, vertex, bedrock):",
    validate: (v) => {
      if (!v.trim()) return "Name required";
      if (config.configs[v.trim()]) return `Profile "${v.trim()}" already exists`;
      return true;
    },
  });

  const profileName = name.trim();
  const env = await promptEnvSelection(envVarsData as EnvVar[]);
  const args = await promptArgs();

  config.configs[profileName] = { env, args };

  if (!config.default) {
    config.default = profileName;
    console.log(chalk.dim(`Set "${profileName}" as default (first profile)`));
  }

  await writeConfig(configPath, config);
  console.log(chalk.green(`✓ Profile "${profileName}" saved`));
}
