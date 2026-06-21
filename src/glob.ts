import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, normalize, relative, resolve, sep } from "node:path";

/**
 * Minimal glob matcher supporting *, **, and ? without extra dependencies.
 */
export function matchGlob(pattern: string, filePath: string): boolean {
  const normalizedPath = normalize(filePath).split(sep).join("/");
  const normalizedPattern = normalize(pattern).split(sep).join("/");

  return matchPattern(normalizedPattern, normalizedPath);
}

function matchPattern(pattern: string, path: string): boolean {
  if (pattern === "**") {
    return true;
  }

  if (pattern.includes("**")) {
    const parts = pattern.split("**");
    if (parts.length === 2) {
      const [prefix, suffix] = parts;
      if (prefix && !path.startsWith(prefix.replace(/\/$/, ""))) {
        return false;
      }
      if (suffix) {
        const cleanSuffix = suffix.startsWith("/") ? suffix.slice(1) : suffix;
        if (!cleanSuffix) {
          return true;
        }
        return path.includes(cleanSuffix) || matchSegments(cleanSuffix.split("/").filter(Boolean), path.split("/"));
      }
      return true;
    }
  }

  return matchSegments(pattern.split("/").filter(Boolean), path.split("/"));
}

function matchSegments(patternParts: string[], pathParts: string[]): boolean {
  let pi = 0;

  for (const part of patternParts) {
    if (part === "**") {
      for (let j = pi; j <= pathParts.length; j++) {
        if (matchSegments(patternParts.slice(patternParts.indexOf(part) + 1), pathParts.slice(j))) {
          return true;
        }
      }
      return false;
    }

    if (pi >= pathParts.length) {
      return false;
    }

    if (!matchSegment(part, pathParts[pi]!)) {
      return false;
    }

    pi++;
  }

  return pi === pathParts.length;
}

function matchSegment(pattern: string, segment: string): boolean {
  if (pattern === "*") {
    return true;
  }

  let pi = 0;
  let si = 0;

  while (pi < pattern.length) {
    if (pattern[pi] === "*") {
      if (pi === pattern.length - 1) {
        return true;
      }
      for (let j = si; j <= segment.length; j++) {
        if (matchSegment(pattern.slice(pi + 1), segment.slice(j))) {
          return true;
        }
      }
      return false;
    }

    if (pattern[pi] === "?") {
      if (si >= segment.length) {
        return false;
      }
      pi++;
      si++;
      continue;
    }

    if (si >= segment.length || pattern[pi] !== segment[si]) {
      return false;
    }

    pi++;
    si++;
  }

  return si === segment.length;
}

export function shouldIgnoreFile(filePath: string, patterns: string[], rootPath: string): boolean {
  if (patterns.length === 0) {
    return false;
  }

  const relativePath = relative(rootPath, filePath).split(sep).join("/");
  const absolutePath = normalize(filePath).split(sep).join("/");

  return patterns.some(
    (pattern) =>
      matchGlob(pattern, relativePath) ||
      matchGlob(pattern, absolutePath) ||
      matchGlob(pattern, filePath.split(sep).join("/")),
  );
}

export function findNearestTsConfig(startPath: string): string {
  let current = resolve(startPath);

  if (!existsSync(current)) {
    throw new Error(`Path does not exist: ${startPath}`);
  }

  if (!statSync(current).isDirectory()) {
    current = dirname(current);
  }

  while (true) {
    const candidate = resolve(current, "tsconfig.json");
    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Could not find tsconfig.json near ${startPath}`);
    }
    current = parent;
  }
}

export function resolveScanRoot(inputPath: string | undefined, cwd: string = process.cwd()): string {
  const base = inputPath ? resolve(cwd, inputPath) : cwd;

  if (!existsSync(base)) {
    throw new Error(`Path does not exist: ${base}`);
  }

  return base;
}

export function isPathWithinRoot(filePath: string, scanRoot: string): boolean {
  const normalizedFile = normalize(resolve(filePath));
  const normalizedRoot = normalize(resolve(scanRoot));

  if (normalizedFile === normalizedRoot) {
    return true;
  }

  return normalizedFile.startsWith(normalizedRoot + sep);
}

export function toPosixPath(filePath: string): string {
  const normalized = isAbsolute(filePath) ? normalize(filePath) : filePath;
  return normalized.replace(/\\/g, "/");
}
