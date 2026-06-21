import { relative } from "node:path";
import type { FixResult, OrphantsResult, OrphantsStats, TypeKind, UnusedType } from "./types";

function formatPath(filePath: string, cwd: string): string {
  const rel = relative(cwd, filePath);
  return rel.split("\\").join("/");
}

function padName(name: string, width: number): string {
  return name.padEnd(width, " ");
}

function countByKind(unused: UnusedType[]): Record<TypeKind, number> {
  return {
    type: unused.filter((item) => item.kind === "type").length,
    interface: unused.filter((item) => item.kind === "interface").length,
    enum: unused.filter((item) => item.kind === "enum").length,
  };
}

export function buildStats(totalTypes: number, totalFiles: number, unused: UnusedType[]): OrphantsStats {
  return {
    totalTypes,
    totalFiles,
    unusedCount: unused.length,
    unusedByKind: countByKind(unused),
  };
}

function formatKindBreakdown(stats: OrphantsStats): string {
  const { unusedByKind } = stats;
  const parts = [
    `${unusedByKind.type} type`,
    `${unusedByKind.interface} interface`,
    `${unusedByKind.enum} enum`,
  ];
  return parts.join(", ");
}

export function formatHumanReport(result: OrphantsResult, cwd: string = process.cwd()): string {
  const lines: string[] = [];
  const { stats, unused } = result;

  lines.push(`Found ${stats.totalTypes} types across ${stats.totalFiles} files`);

  if (unused.length === 0) {
    lines.push("✓ No unused types detected");
    return lines.join("\n");
  }

  lines.push(`✗ ${unused.length} unused types detected (${formatKindBreakdown(stats)})`);
  lines.push("");

  const maxNameWidth = Math.max(...unused.map((u) => u.name.length), 4);

  for (const item of unused) {
    const path = formatPath(item.filePath, cwd);
    lines.push(`  ${padName(item.name, maxNameWidth)}  ${path}:${item.line}`);
  }

  lines.push("");
  lines.push("Run with --fix to remove them");

  return lines.join("\n");
}

export function formatStatsOnlyReport(result: OrphantsResult): string {
  const { stats } = result;

  if (stats.unusedCount === 0) {
    return `unused=0 total=${stats.totalTypes} files=${stats.totalFiles}`;
  }

  const { unusedByKind } = stats;
  return [
    `unused=${stats.unusedCount}`,
    `types=${unusedByKind.type}`,
    `interfaces=${unusedByKind.interface}`,
    `enums=${unusedByKind.enum}`,
    `total=${stats.totalTypes}`,
    `files=${stats.totalFiles}`,
  ].join(" ");
}

export function formatFixReport(fixResult: FixResult): string {
  const lines: string[] = [];
  lines.push(`✓ Removed ${fixResult.removedCount} unused types`);
  lines.push(`✓ ${fixResult.filesTouched} files cleaned`);
  return lines.join("\n");
}

export function formatJsonReport(result: OrphantsResult, cwd: string = process.cwd()): string {
  const payload = {
    stats: result.stats,
    unused: result.unused.map((item) => ({
      ...item,
      filePath: formatPath(item.filePath, cwd),
    })),
  };

  return JSON.stringify(payload, null, 2);
}

export function printReport(
  result: OrphantsResult,
  options: { json?: boolean; statsOnly?: boolean; cwd?: string; fixResult?: FixResult },
): void {
  const cwd = options.cwd ?? process.cwd();

  if (options.fixResult) {
    console.log(formatFixReport(options.fixResult));
    return;
  }

  if (options.json) {
    console.log(formatJsonReport(result, cwd));
    return;
  }

  if (options.statsOnly) {
    console.log(formatStatsOnlyReport(result));
    return;
  }

  console.log(formatHumanReport(result, cwd));
}
