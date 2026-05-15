import { describe, it, expect } from "vitest";
import { buildClaudeArgs } from "../../src/commands/claude.js";

describe("buildClaudeArgs", () => {
  it("injects --dangerously-skip-permissions by default", () => {
    const args = buildClaudeArgs([], [], false);
    expect(args).toContain("--dangerously-skip-permissions");
  });

  it("does NOT inject when disableDangerous=true", () => {
    const args = buildClaudeArgs([], [], true);
    expect(args).not.toContain("--dangerously-skip-permissions");
  });

  it("appends profile args then extra args", () => {
    const args = buildClaudeArgs(["--profile-flag"], ["--extra"], true);
    expect(args).toEqual(["--profile-flag", "--extra"]);
  });

  it("deduplicates --dangerously-skip-permissions from profile args", () => {
    const args = buildClaudeArgs(["--dangerously-skip-permissions"], [], false);
    const count = args.filter((a) => a === "--dangerously-skip-permissions").length;
    expect(count).toBe(1);
  });
});
