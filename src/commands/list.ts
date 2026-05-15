import chalk from "chalk";
import { readConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";

export async function listCommand(): Promise<void> {
  const config = await readConfig(getConfigPath());
  const names = Object.keys(config.configs);

  if (names.length === 0) {
    console.log(chalk.dim("No profiles. Run `cc-wrapper new` to create one."));
    return;
  }

  for (const name of names) {
    const isDefault = name === config.default;
    const bullet = isDefault ? chalk.green("●") : chalk.dim("○");
    const label = isDefault ? chalk.bold(name) + chalk.dim(" (default)") : name;
    console.log(`${bullet} ${label}`);
  }
}
