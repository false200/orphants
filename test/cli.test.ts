import { describe, expect, it, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fixturePath } from "./helpers";

const cliPath = resolve(process.cwd(), "dist/cli.js");

describe("cli", () => {
  beforeAll(() => {
    if (!existsSync(cliPath)) {
      throw new Error("dist/cli.js not found — run npm run build before tests");
    }
  });
  it("reports unused types from a fixture", () => {
    const output = execFileSync(
      process.execPath,
      [cliPath, fixturePath("basic-unused/src"), "--json"],
      { encoding: "utf8" },
    );

    const parsed = JSON.parse(output) as { unused: Array<{ name: string }> };
    expect(parsed.unused.map((item) => item.name)).toEqual(["DeadType"]);
  });

  it("exits with code 1 in ci mode when unused types exist", () => {
    expect(() => {
      execFileSync(process.execPath, [cliPath, fixturePath("basic-unused/src"), "--ci"], {
        encoding: "utf8",
      });
    }).toThrow();
  });
});
