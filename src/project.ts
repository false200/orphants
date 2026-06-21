import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { Project, type SourceFile } from "ts-morph";
import type { OrphantsContext } from "./types";
import {
  findNearestTsConfig,
  isPathWithinRoot,
  resolveScanRoot,
  shouldIgnoreFile,
} from "./glob";

export interface LoadedProject {
  project: Project;
  context: OrphantsContext;
  scanRoot: string;
}

export function loadProject(options: {
  path?: string;
  project?: string;
  ignore?: string[];
  includeExported?: boolean;
  cwd?: string;
}): LoadedProject {
  const cwd = options.cwd ?? process.cwd();
  const scanRoot = resolveScanRoot(options.path, cwd);
  const tsConfigFilePath = resolveTsConfigPath(options.project, scanRoot, cwd);

  const project = new Project({
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: false,
  });

  const context: OrphantsContext = {
    rootPath: dirname(tsConfigFilePath),
    tsConfigFilePath,
    ignorePatterns: options.ignore ?? [],
    includeExported: options.includeExported ?? false,
  };

  return { project, context, scanRoot };
}

function resolveTsConfigPath(
  explicitPath: string | undefined,
  scanRoot: string,
  cwd: string,
): string {
  if (!explicitPath) {
    return findNearestTsConfig(scanRoot);
  }

  const candidate = isAbsolute(explicitPath)
    ? resolve(explicitPath)
    : resolve(cwd, explicitPath);

  if (!existsSync(candidate)) {
    throw new Error(`Could not find tsconfig at ${explicitPath}`);
  }

  if (!candidate.endsWith(".json")) {
    throw new Error(`Project path must point to a tsconfig.json file: ${explicitPath}`);
  }

  return candidate;
}

export function getScannableSourceFiles(
  project: Project,
  scanRoot: string,
  context: OrphantsContext,
): SourceFile[] {
  const scanRootResolved = resolve(scanRoot);
  const isFile = statSync(scanRootResolved).isFile();

  return project
    .getSourceFiles()
    .filter((file) => {
      const filePath = file.getFilePath();

      if (file.isDeclarationFile()) {
        return false;
      }

      if (filePath.endsWith(".d.ts")) {
        return false;
      }

      if (isFile) {
        return resolve(filePath) === scanRootResolved;
      }

      if (!isPathWithinRoot(filePath, scanRootResolved)) {
        return false;
      }

      if (shouldIgnoreFile(filePath, context.ignorePatterns, context.rootPath)) {
        return false;
      }

      return true;
    });
}
