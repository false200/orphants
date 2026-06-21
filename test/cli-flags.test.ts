import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fixturePath } from "./helpers.ts";

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const cliScript = resolve(process.cwd(), "src/cli.ts");
const packageVersion = (
  JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as { version: string }
).version;

describe("cli flags", () => {
  it("prints version", () => {
    const output = execFileSync(process.execPath, [tsxCli, cliScript, "--version"], {
      encoding: "utf8",
    });
    expect(output.trim()).toBe(packageVersion);
  });

  it("prints stats-only output", () => {
    const output = execFileSync(
      process.execPath,
      [tsxCli, cliScript, fixturePath("basic-unused/src"), "--stats-only"],
      { encoding: "utf8" },
    );
    expect(output.trim()).toMatch(/^unused=1 types=/);
  });
});
