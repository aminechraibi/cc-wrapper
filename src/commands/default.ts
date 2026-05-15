import chalk from "chalk";
import { readConfig, writeConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";

export async function defaultCommand(name: string): Promise<void> {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  if (!config.configs[name]) {
    console.error(chalk.red(`Profile "${name}" not found`));
    process.exit(1);
  }

  config.default = name;
  await writeConfig(configPath, config);
  console.log(chalk.green(`✓ Default set to "${name}"`));
}
