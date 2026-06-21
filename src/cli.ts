#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { findUnusedTypes, removeUnusedTypes } from "./index";
import { printReport } from "./reporter";

const packageJson = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
) as { version: string };

const program = new Command();

program
  .name("orphants")
  .description("Find and remove unused TypeScript type aliases, interfaces, and enums")
  .version(packageJson.version)
  .argument("[path]", "Path to scan (file or directory)", ".")
  .option("-p, --project <tsconfig>", "Path to tsconfig.json")
  .option("--fix", "Remove unused types in place")
  .option("--json", "Output results as JSON")
  .option("--stats-only", "Print summary counts only, without listing each unused type")
  .option("--ignore <pattern>", "Glob pattern of files to skip", collect, [])
  .option("--include-exported", "Also flag exported types with no external consumers")
  .option("--ci", "Exit with code 1 if any unused types are found")
  .action(async (path: string, options: CliOptions) => {
    try {
      const opts = {
        path,
        project: options.project,
        fix: options.fix,
        json: options.json,
        statsOnly: options.statsOnly,
        ignore: options.ignore,
        includeExported: options.includeExported,
        ci: options.ci,
      };

      if (opts.fix) {
        const { result, fixResult } = await removeUnusedTypes(opts);
        printReport(result, {
          json: opts.json,
          statsOnly: opts.statsOnly,
          fixResult: opts.json ? undefined : fixResult,
        });

        if (opts.json) {
          console.log(JSON.stringify({ fix: fixResult }, null, 2));
        }

        process.exit(0);
        return;
      }

      const result = await findUnusedTypes(opts);
      printReport(result, { json: opts.json, statsOnly: opts.statsOnly });

      if (opts.ci && result.unused.length > 0) {
        process.exit(1);
        return;
      }

      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}`);
      process.exit(2);
    }
  });

interface CliOptions {
  project?: string;
  fix?: boolean;
  json?: boolean;
  statsOnly?: boolean;
  ignore: string[];
  includeExported?: boolean;
  ci?: boolean;
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

program.parse();
