import chalk from "chalk";
import { readConfig, writeConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";
import { promptEnvSelection, promptArgs } from "../prompts/env-selector.js";
import envVarsData from "../data/env-vars.json" with { type: "json" };
import type { EnvVar } from "../types/index.js";

export async function editCommand(name: string): Promise<void> {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  if (!config.configs[name]) {
    console.error(chalk.red(`Profile "${name}" not found`));
    process.exit(1);
  }

  const profile = config.configs[name];
  const env = await promptEnvSelection(envVarsData as EnvVar[], profile.env);
  const args = await promptArgs(profile.args);

  config.configs[name] = { env, args };
  await writeConfig(configPath, config);
  console.log(chalk.green(`✓ Profile "${name}" updated`));
}
