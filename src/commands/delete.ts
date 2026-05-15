import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { readConfig, writeConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";

export async function deleteCommand(name: string): Promise<void> {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  if (!config.configs[name]) {
    console.error(chalk.red(`Profile "${name}" not found`));
    process.exit(1);
  }

  const ok = await confirm({ message: `Delete profile "${name}"?`, default: false });
  if (!ok) {
    console.log(chalk.dim("Cancelled"));
    return;
  }

  delete config.configs[name];

  if (config.default === name) {
    const remaining = Object.keys(config.configs);
    config.default = remaining[0] ?? null;
    if (config.default) {
      console.log(chalk.dim(`Default changed to "${config.default}"`));
    }
  }

  await writeConfig(configPath, config);
  console.log(chalk.green(`✓ Profile "${name}" deleted`));
}
