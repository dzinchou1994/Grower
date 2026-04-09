import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const chunksDir = path.join(projectRoot, ".next", "static", "chunks");
const buildManifestPath = path.join(projectRoot, ".next", "build-manifest.json");
const baselineDir = path.join(projectRoot, ".perf");
const baselineFile = path.join(baselineDir, "bundle-baseline.json");

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }
      return [fullPath];
    }),
  );
  return files.flat();
}

function toChunkRelativePath(filePath) {
  return filePath.replace(/^static\/chunks\//, "");
}

async function getInitialChunkSet() {
  const raw = await readFile(buildManifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const candidates = [
    ...(manifest.rootMainFiles ?? []),
    ...(manifest.polyfillFiles ?? []),
  ];
  return new Set(candidates.map(toChunkRelativePath));
}

async function collectStats() {
  const initialChunkSet = await getInitialChunkSet();
  const allFiles = await walkFiles(chunksDir);
  const chunkFiles = allFiles.filter((filePath) => filePath.endsWith(".js"));
  const details = await Promise.all(
    chunkFiles.map(async (absolutePath) => {
      const fileStat = await stat(absolutePath);
      const relativePath = path.relative(chunksDir, absolutePath);
      return {
        file: relativePath,
        bytes: fileStat.size,
        initial: initialChunkSet.has(relativePath),
      };
    }),
  );

  const totalBytes = details.reduce((sum, entry) => sum + entry.bytes, 0);
  const initialBytes = details
    .filter((entry) => entry.initial)
    .reduce((sum, entry) => sum + entry.bytes, 0);
  const largestChunks = [...details]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20);

  return {
    generatedAt: new Date().toISOString(),
    totalBytes,
    initialBytes,
    chunkCount: details.length,
    largestChunks,
  };
}

async function main() {
  const statsPayload = await collectStats();
  await mkdir(baselineDir, { recursive: true });
  await writeFile(baselineFile, `${JSON.stringify(statsPayload, null, 2)}\n`, "utf8");

  console.log("Saved performance baseline:");
  console.log(`- File: ${path.relative(projectRoot, baselineFile)}`);
  console.log(`- Total JS chunks: ${statsPayload.totalBytes} bytes`);
  console.log(`- Initial JS chunks: ${statsPayload.initialBytes} bytes`);
  console.log(`- Chunk files: ${statsPayload.chunkCount}`);
}

main().catch((error) => {
  console.error("Failed to collect build stats:", error);
  process.exit(1);
});
