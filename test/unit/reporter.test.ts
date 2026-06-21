import { describe, expect, it, vi } from "vitest";
import {
  buildStats,
  formatFixReport,
  formatHumanReport,
  formatJsonReport,
  formatStatsOnlyReport,
  printReport,
} from "../../src/reporter";
import type { OrphantsResult } from "../../src/types";

describe("reporter", () => {
  const sampleResult: OrphantsResult = {
    stats: buildStats(
      6,
      1,
      [
        { name: "DeadType", kind: "type", filePath: "D:/app/src/index.ts", line: 1 },
        { name: "DeadIface", kind: "interface", filePath: "D:/app/src/index.ts", line: 2 },
        { name: "DeadEnum", kind: "enum", filePath: "D:/app/src/index.ts", line: 3 },
      ],
    ),
    unused: [
      { name: "DeadType", kind: "type", filePath: "D:/app/src/index.ts", line: 1 },
      { name: "DeadIface", kind: "interface", filePath: "D:/app/src/index.ts", line: 2 },
      { name: "DeadEnum", kind: "enum", filePath: "D:/app/src/index.ts", line: 3 },
    ],
    candidates: [],
  };

  it("formats a human report with kind breakdown", () => {
    const output = formatHumanReport(sampleResult, "D:/app");
    expect(output).toContain("Found 6 types across 1 files");
    expect(output).toContain("3 unused types detected (1 type, 1 interface, 1 enum)");
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

  it("formats stats-only output", () => {
    expect(formatStatsOnlyReport(sampleResult)).toBe(
      "unused=3 types=1 interfaces=1 enums=1 total=6 files=1",
    );
    expect(formatStatsOnlyReport({ ...sampleResult, unused: [], stats: buildStats(3, 1, []) })).toBe(
      "unused=0 total=3 files=1",
    );
  });

  it("formats json output with unusedByKind", () => {
    const json = formatJsonReport(sampleResult, "D:/app");
    const parsed = JSON.parse(json) as {
      stats: { unusedCount: number; unusedByKind: { type: number } };
      unused: unknown[];
    };
    expect(parsed.stats.unusedCount).toBe(3);
    expect(parsed.stats.unusedByKind.type).toBe(1);
    expect(parsed.unused).toHaveLength(3);
  });

  it("formats fix output", () => {
    expect(formatFixReport({ removedCount: 2, filesTouched: 1 })).toContain("Removed 2 unused types");
  });

  it("prints human, json, stats-only, and fix reports", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    printReport(sampleResult, { cwd: "D:/app" });
    printReport(sampleResult, { json: true, cwd: "D:/app" });
    printReport(sampleResult, { statsOnly: true });
    printReport(sampleResult, { fixResult: { removedCount: 1, filesTouched: 1 } });

    expect(log).toHaveBeenCalledTimes(4);
    log.mockRestore();
  });
});
