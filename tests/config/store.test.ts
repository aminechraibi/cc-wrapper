import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readConfig, writeConfig } from "../../src/config/store.js";

const TEST_DIR = join(tmpdir(), "cc-wrapper-test-" + process.pid);
const TEST_CONFIG = join(TEST_DIR, "config.json");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe("readConfig", () => {
  it("returns empty config when file does not exist", async () => {
    const cfg = await readConfig(TEST_CONFIG);
    expect(cfg).toEqual({ default: null, configs: {} });
  });

  it("parses existing valid config", async () => {
    const data = {
      default: "local",
      configs: {
        local: {
          env: { ANTHROPIC_BASE_URL: "http://localhost:8787" },
          args: [],
        },
      },
    };
    writeFileSync(TEST_CONFIG, JSON.stringify(data));
    const cfg = await readConfig(TEST_CONFIG);
    expect(cfg.default).toBe("local");
    expect(cfg.configs.local.env.ANTHROPIC_BASE_URL).toBe("http://localhost:8787");
  });

  it("throws on invalid JSON shape", async () => {
    writeFileSync(TEST_CONFIG, JSON.stringify({ invalid: true }));
    await expect(readConfig(TEST_CONFIG)).rejects.toThrow();
  });
});

describe("writeConfig", () => {
  it("writes config to file", async () => {
    const cfg = { default: null, configs: {} };
    await writeConfig(TEST_CONFIG, cfg);
    const cfg2 = await readConfig(TEST_CONFIG);
    expect(cfg2).toEqual(cfg);
  });

  it("round-trips a profile", async () => {
    const cfg = {
      default: "prod",
      configs: {
        prod: {
          env: { ANTHROPIC_BASE_URL: "https://api.anthropic.com" },
          args: ["--dangerously-skip-permissions"],
        },
      },
    };
    await writeConfig(TEST_CONFIG, cfg);
    const cfg2 = await readConfig(TEST_CONFIG);
    expect(cfg2.configs.prod.env.ANTHROPIC_BASE_URL).toBe("https://api.anthropic.com");
    expect(cfg2.configs.prod.args).toContain("--dangerously-skip-permissions");
  });
});
