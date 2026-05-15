import { cac } from "cac";
import { newCommand } from "./commands/new.js";
import { listCommand } from "./commands/list.js";
import { defaultCommand } from "./commands/default.js";
import { editCommand } from "./commands/edit.js";
import { deleteCommand } from "./commands/delete.js";
import { claudeCommand } from "./commands/claude.js";

const cli = cac("cc");

cli
  .command("new", "Create a new profile")
  .action(newCommand);

cli
  .command("list", "List all profiles")
  .action(listCommand);

cli
  .command("default <name>", "Set default profile")
  .action(defaultCommand);

cli
  .command("edit <name>", "Edit a profile interactively")
  .action(editCommand);

cli
  .command("delete <name>", "Delete a profile")
  .action(deleteCommand);

cli
  .command("claude [...args]", "Run claude with the default profile")
  .option("--dd", "Disable --dangerously-skip-permissions injection")
  .option("-p, --profile <name>", "Use a specific profile instead of default")
  .action((args: string[], options: { dd?: boolean; profile?: string }) => {
    return claudeCommand(args, options);
  });

cli.help();
cli.version("0.1.0");

cli.parse();
