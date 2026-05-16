import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  isEnterKey,
  isUpKey,
  isDownKey,
  isBackspaceKey,
  isSpaceKey,
} from "@inquirer/core";
import chalk from "chalk";

export type SearchableChoice = {
  name: string;
  value: string;
  checked?: boolean;
  description?: string;
};

type Config = {
  message: string;
  choices: SearchableChoice[];
  pageSize?: number;
};

export const searchableCheckbox = createPrompt<string[], Config>(
  (config, done) => {
    const pageSize = config.pageSize ?? 12;

    const [search, setSearch] = useState("");
    const [cursor, setCursor] = useState(0);
    const [checked, setChecked] = useState<Set<number>>(() => {
      const s = new Set<number>();
      config.choices.forEach((c, i) => {
        if (c.checked) s.add(i);
      });
      return s;
    });
    const [isDone, setIsDone] = useState(false);
    const prefix = usePrefix({ status: isDone ? "done" : "idle" });

    const term = search.toLowerCase();
    const filtered = config.choices
      .map((c, i) => ({ ...c, originalIndex: i }))
      .filter(
        (c) =>
          !term ||
          c.name.toLowerCase().includes(term) ||
          (c.description?.toLowerCase().includes(term) ?? false)
      );

    const safeCursor =
      filtered.length === 0 ? 0 : Math.min(cursor, filtered.length - 1);

    useKeypress(async (key) => {
      if (isDone) return;

      if (isEnterKey(key)) {
        setIsDone(true);
        // Defer done() by one event-loop cycle (poll → check) so that the
        // trailing \n from Windows \r\n arrives as a keypress while this
        // handler is still registered (isDone=true → silently discarded).
        // Newer @inquirer/core resolves synchronously; older versions used
        // setImmediate, which naturally absorbed the phantom keystroke.
        await new Promise<void>((r) => setImmediate(r));
        done(
          config.choices
            .filter((_, i) => checked.has(i))
            .map((c) => c.value)
        );
      } else if (isSpaceKey(key)) {
        const item = filtered[safeCursor];
        if (!item) return;
        const next = new Set(checked);
        if (next.has(item.originalIndex)) {
          next.delete(item.originalIndex);
        } else {
          next.add(item.originalIndex);
        }
        setChecked(next);
      } else if (isUpKey(key)) {
        setCursor(Math.max(0, safeCursor - 1));
      } else if (isDownKey(key)) {
        setCursor(Math.min(filtered.length - 1, safeCursor + 1));
      } else if (isBackspaceKey(key)) {
        setSearch(search.slice(0, -1));
        setCursor(0);
      } else if (
        key.sequence &&
        key.sequence.length === 1 &&
        !key.ctrl &&
        !key.meta &&
        key.sequence !== '\r' &&
        key.sequence !== '\n'
      ) {
        setSearch(search + key.sequence);
        setCursor(0);
      }
    });

    if (isDone) {
      return `${prefix} ${chalk.bold(config.message)} ${chalk.cyan(`${checked.size} selected`)}`;
    }

    const startPage = Math.max(
      0,
      Math.min(
        safeCursor - Math.floor(pageSize / 2),
        Math.max(0, filtered.length - pageSize)
      )
    );
    const visibleItems = filtered.slice(startPage, startPage + pageSize);

    // Search box — rounded borders, fixed inner width
    const termCols = process.stdout.columns ?? 72;
    const BOX_INNER = Math.min(50, Math.max(36, termCols - 6));
    const ICON = "⌕  "; // 3 visible chars
    // layout: │ + " " + ICON + searchText + cursor + padding + " " + │
    // inner = 1(left pad) + 3(icon) + textArea + 1(right pad) = BOX_INNER
    const textArea = BOX_INNER - 5;
    const displayText = search.length > textArea - 1
      ? search.slice(-(textArea - 1))
      : search;
    const padLen = Math.max(0, textArea - displayText.length - 1);
    const topBar    = chalk.cyan("╭" + "─".repeat(BOX_INNER) + "╮");
    const bottomBar = chalk.cyan("╰" + "─".repeat(BOX_INNER) + "╯");
    const midBar =
      chalk.cyan("│") +
      " " +
      chalk.cyan(ICON) +
      chalk.white(displayText) +
      chalk.inverse(" ") +
      " ".repeat(padLen) +
      " " +
      chalk.cyan("│");
    const searchBox = [topBar, midBar, bottomBar].join("\n");

    const numWidth = String(config.choices.length).length;
    const rows = visibleItems.map((item, relIdx) => {
      const absIdx = startPage + relIdx;
      const isActive = absIdx === safeCursor;
      const isChecked = checked.has(item.originalIndex);
      const box = isChecked ? chalk.green("◉") : chalk.dim("○");
      const arrow = isActive ? chalk.cyan("▶") : " ";
      const num = chalk.dim(String(item.originalIndex + 1).padStart(numWidth) + ".");
      const label = isActive ? chalk.bold(item.name) : item.name;
      return ` ${arrow} ${box} ${num} ${label}`;
    });

    if (filtered.length === 0) {
      rows.push(chalk.dim("  (no results — type less or press Backspace)"));
    }

    const activeItem = filtered[safeCursor];
    const descLine =
      activeItem?.description
        ? chalk.dim(`       ↳ ${activeItem.description}`)
        : "";

    const footer = chalk.dim(
      `  ↑↓ navigate · SPACE toggle · ENTER confirm · ${checked.size} selected · ${filtered.length}/${config.choices.length} shown`
    );

    return [
      `${prefix} ${chalk.bold(config.message)}`,
      searchBox,
      ...rows,
      descLine,
      footer,
    ]
      .filter(Boolean)
      .join("\n");
  }
);
