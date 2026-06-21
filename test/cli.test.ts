import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fixturePath } from "./helpers";

const cliPath = resolve(process.cwd(), "dist/cli.js");

describe("cli", () => {
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
