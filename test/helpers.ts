import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));

export function fixturePath(name: string): string {
  return resolve(testDir, "fixtures", name);
}
