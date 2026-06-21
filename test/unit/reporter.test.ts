import { describe, expect, it, vi } from "vitest";
import {
  buildStats,
  formatFixReport,
  formatHumanReport,
  formatJsonReport,
  printReport,
} from "../../src/reporter";
import type { OrphantsResult } from "../../src/types";

describe("reporter", () => {
  const sampleResult: OrphantsResult = {
    stats: buildStats(3, 1, [
      { name: "DeadType", kind: "type", filePath: "D:/app/src/index.ts", line: 1 },
    ]),
    unused: [{ name: "DeadType", kind: "type", filePath: "D:/app/src/index.ts", line: 1 }],
    candidates: [],
  };

  it("formats a human report with unused types", () => {
    const output = formatHumanReport(sampleResult, "D:/app");
    expect(output).toContain("Found 3 types across 1 files");
    expect(output).toContain("1 unused types detected");
    expect(output).toContain("DeadType");
    expect(output).toContain("Run with --fix to remove them");
  });

  it("formats a clean human report", () => {
    const clean: OrphantsResult = {
      ...sampleResult,
      unused: [],
      stats: buildStats(3, 1, []),
    };
    const output = formatHumanReport(clean, "D:/app");
    expect(output).toContain("No unused types detected");
  });

  it("formats json output", () => {
    const json = formatJsonReport(sampleResult, "D:/app");
    const parsed = JSON.parse(json) as { stats: { unusedCount: number }; unused: unknown[] };
    expect(parsed.stats.unusedCount).toBe(1);
    expect(parsed.unused).toHaveLength(1);
  });

  it("formats fix output", () => {
    expect(formatFixReport({ removedCount: 2, filesTouched: 1 })).toContain("Removed 2 unused types");
  });

  it("prints human, json, and fix reports", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    printReport(sampleResult, { cwd: "D:/app" });
    printReport(sampleResult, { json: true, cwd: "D:/app" });
    printReport(sampleResult, { fixResult: { removedCount: 1, filesTouched: 1 } });

    expect(log).toHaveBeenCalledTimes(3);
    log.mockRestore();
  });
});
