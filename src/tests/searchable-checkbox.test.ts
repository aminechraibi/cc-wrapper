import { describe, it, expect } from "vitest";
import { PassThrough } from "node:stream";
import { searchableCheckbox } from "../prompts/searchable-checkbox.js";

const CHOICES = [
  { name: "ANTHROPIC_API_KEY", value: "ANTHROPIC_API_KEY", description: "API key" },
  { name: "ANTHROPIC_BASE_URL", value: "ANTHROPIC_BASE_URL", description: "Base URL" },
  { name: "HTTP_PROXY", value: "HTTP_PROXY", description: "HTTP proxy" },
];

function makeStreams() {
  const inp = new PassThrough();
  const out = new PassThrough();
  out.on("data", () => {}); // drain output
  return { inp, out };
}

async function tick(ms = 10) {
  await new Promise((r) => setTimeout(r, ms));
}

describe("searchableCheckbox", () => {
  it("confirms with empty selection on ENTER", async () => {
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write("\r");
    const result = await p;
    expect(result).toEqual([]);
  });

  it("selects item with SPACE then confirms with ENTER", async () => {
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write(" "); // select first
    await tick();
    inp.write("\r"); // confirm
    const result = await p;
    expect(result).toEqual(["ANTHROPIC_API_KEY"]);
  });

  it("filters by search term", async () => {
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write("proxy"); // filter to HTTP_PROXY
    await tick();
    inp.write(" "); // select it
    await tick();
    inp.write("\r"); // confirm
    const result = await p;
    expect(result).toEqual(["HTTP_PROXY"]);
  });

  it("backspace removes search characters", async () => {
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write("proxy"); // filter
    await tick();
    inp.write("\x7f"); // backspace
    inp.write("\x7f");
    inp.write("\x7f");
    inp.write("\x7f");
    inp.write("\x7f"); // clear → all visible
    await tick();
    inp.write(" "); // select first item (API_KEY, back to full list)
    await tick();
    inp.write("\r");
    const result = await p;
    expect(result).toEqual(["ANTHROPIC_API_KEY"]);
  });

  it("pre-checks existing selections", async () => {
    const { inp, out } = makeStreams();
    const choices = CHOICES.map((c) => ({
      ...c,
      checked: c.value === "HTTP_PROXY",
    }));
    const p = searchableCheckbox({ message: "Pick", choices }, { input: inp, output: out });
    await tick();
    inp.write("\r"); // confirm without changing
    const result = await p;
    expect(result).toEqual(["HTTP_PROXY"]);
  });

  it("arrow keys navigate the list", async () => {
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write("\x1b[B"); // down
    await tick();
    inp.write(" "); // select second item (ANTHROPIC_BASE_URL)
    await tick();
    inp.write("\r");
    const result = await p;
    expect(result).toEqual(["ANTHROPIC_BASE_URL"]);
  });

  it("does not add newline characters to search string", async () => {
    // Regression: \\r or \\n should not append to search — they should confirm
    const { inp, out } = makeStreams();
    const p = searchableCheckbox({ message: "Pick", choices: CHOICES }, { input: inp, output: out });
    await tick();
    inp.write("proxy");
    await tick();
    inp.write("\r\n"); // Windows-style ENTER — must confirm, not append \\n to search
    const result = await p;
    // Should not have filtered to zero results and errored; should return empty
    expect(Array.isArray(result)).toBe(true);
  });
});
