#!/usr/bin/env node

import { Command } from "commander";
import { findUnusedTypes, removeUnusedTypes } from "./index";
import { printReport } from "./reporter";

const program = new Command();

program
  .name("orphants")
  .description("Find and remove unused TypeScript type aliases, interfaces, and enums")
  .argument("[path]", "Path to scan (file or directory)", ".")
  .option("--fix", "Remove unused types in place")
  .option("--json", "Output results as JSON")
  .option("--ignore <pattern>", "Glob pattern of files to skip", collect, [])
  .option("--include-exported", "Also flag exported types with no external consumers")
  .option("--ci", "Exit with code 1 if any unused types are found")
  .action(async (path: string, options: CliOptions) => {
    try {
      const opts = {
        path,
        fix: options.fix,
        json: options.json,
        ignore: options.ignore,
        includeExported: options.includeExported,
        ci: options.ci,
      };

      if (opts.fix) {
        const { result, fixResult } = await removeUnusedTypes(opts);
        printReport(result, { json: opts.json, fixResult: opts.json ? undefined : fixResult });

        if (opts.json) {
          console.log(JSON.stringify({ fix: fixResult }, null, 2));
        }

        process.exit(0);
        return;
      }

      const result = await findUnusedTypes(opts);
      printReport(result, { json: opts.json });

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
  fix?: boolean;
  json?: boolean;
  ignore: string[];
  includeExported?: boolean;
  ci?: boolean;
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

program.parse();
