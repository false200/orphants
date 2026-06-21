import { describe, expect, it, beforeEach } from "vitest";
import { writeFileSync } from "node:fs";
import { findUnusedTypes } from "../src/index.ts";
import { fixturePath } from "./helpers.ts";

const fixMeSource = `type RemoveMe = { id: string };

type KeepMe = { name: string };

const item: KeepMe = { name: "test" };

export { item };
`;

describe("integration fixtures", () => {
  it(
    "detects basic unused types",
    async () => {
      const result = await findUnusedTypes({ path: fixturePath("basic-unused/src") });
      expect(result.unused.map((u) => u.name)).toEqual(["DeadType"]);
    },
    15000,
  );

  it("keeps referenced types, interfaces, enums, and generics", async () => {
    const result = await findUnusedTypes({ path: fixturePath("used-types/src") });
    expect(result.unused.map((u) => u.name)).toEqual(["UnusedStatusHelper"]);
  });

  it("does not flag re-exported types", async () => {
    const result = await findUnusedTypes({ path: fixturePath("re-export/src") });
    expect(result.unused).toHaveLength(0);
  });

  it("does not flag declaration merging targets", async () => {
    const result = await findUnusedTypes({ path: fixturePath("declaration-merge/src") });
    expect(result.unused.map((u) => u.name)).toEqual(["DeadMergeHelper"]);
  });

  it("does not flag types referenced in JSDoc", async () => {
    const result = await findUnusedTypes({ path: fixturePath("jsdoc-reference/src") });
    expect(result.unused).toHaveLength(0);
  });

  it("preserves exported types by default", async () => {
    const result = await findUnusedTypes({ path: fixturePath("exported-unused/src") });
    expect(result.unused).toHaveLength(0);
  });

  it("flags exported types with --include-exported", async () => {
    const result = await findUnusedTypes({
      path: fixturePath("exported-unused/src"),
      includeExported: true,
    });
    expect(result.unused.map((u) => u.name)).toEqual(["PublicUnused"]);
  });

  it("skips ambient declaration files", async () => {
    const result = await findUnusedTypes({ path: fixturePath("ambient-skip/src") });
    expect(result.unused.map((u) => u.name)).toEqual(["LocalDead"]);
  });

  it("respects ignore globs", async () => {
    const result = await findUnusedTypes({
      path: fixturePath("ignore-glob"),
      ignore: ["**/legacy/**"],
    });
    expect(result.unused).toHaveLength(0);
  });

  it("detects unused enums", async () => {
    const result = await findUnusedTypes({ path: fixturePath("enum-fixture/src") });
    expect(result.unused.map((u) => u.name)).toEqual(["UnusedColor"]);
  });
});

describe("removeUnusedTypes", () => {
  beforeEach(() => {
    writeFileSync(fixturePath("fix-me/src/index.ts"), fixMeSource);
  });

  it(
    "removes unused types with --fix flow",
    async () => {
    const { removeUnusedTypes } = await import("../src/index");
    const fixFixture = fixturePath("fix-me/src");

    const before = await findUnusedTypes({ path: fixFixture });
    expect(before.unused.map((u) => u.name)).toEqual(["RemoveMe"]);

    const { fixResult } = await removeUnusedTypes({ path: fixFixture });
    expect(fixResult.removedCount).toBe(1);
    expect(fixResult.filesTouched).toBe(1);

    const after = await findUnusedTypes({ path: fixFixture });
    expect(after.unused).toHaveLength(0);
  },
  15000,
  );
});
