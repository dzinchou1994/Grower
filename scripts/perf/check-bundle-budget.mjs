import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const chunksDir = path.join(projectRoot, ".next", "static", "chunks");
const buildManifestPath = path.join(projectRoot, ".next", "build-manifest.json");
const baselineFile = path.join(projectRoot, ".perf", "bundle-baseline.json");

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const totalBudgetBytes = parseNumber(process.env.BUNDLE_BUDGET_TOTAL_BYTES, 850000);
const initialBudgetBytes = parseNumber(process.env.BUNDLE_BUDGET_INITIAL_BYTES, 650000);
const growthBudgetPercent = parseNumber(process.env.BUNDLE_BUDGET_GROWTH_PERCENT, 15);

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

async function collectCurrentStats() {
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

  return {
    totalBytes,
    initialBytes,
    chunkCount: details.length,
  };
}

function exceedsGrowthBudget(current, baseline) {
  const limit = baseline * (1 + growthBudgetPercent / 100);
  return current > limit;
}

async function main() {
  const current = await collectCurrentStats();
  const failures = [];

  if (current.totalBytes > totalBudgetBytes) {
    failures.push(
      `Total JS chunks ${current.totalBytes} bytes exceeds budget ${totalBudgetBytes} bytes.`,
    );
  }

  if (current.initialBytes > initialBudgetBytes) {
    failures.push(
      `Initial JS chunks ${current.initialBytes} bytes exceeds budget ${initialBudgetBytes} bytes.`,
    );
  }

  try {
    const baselineRaw = await readFile(baselineFile, "utf8");
    const baseline = JSON.parse(baselineRaw);

    if (baseline?.totalBytes && exceedsGrowthBudget(current.totalBytes, baseline.totalBytes)) {
      failures.push(
        `Total JS grew beyond ${growthBudgetPercent}% of baseline (${baseline.totalBytes} -> ${current.totalBytes}).`,
      );
    }
    if (baseline?.initialBytes && exceedsGrowthBudget(current.initialBytes, baseline.initialBytes)) {
      failures.push(
        `Initial JS grew beyond ${growthBudgetPercent}% of baseline (${baseline.initialBytes} -> ${current.initialBytes}).`,
      );
    }
  } catch {
    console.warn(
      "No baseline file found at .perf/bundle-baseline.json; using fixed budgets only for this run.",
    );
  }

  console.log("Bundle budget report:");
  console.log(`- Total JS chunks: ${current.totalBytes} bytes`);
  console.log(`- Initial JS chunks: ${current.initialBytes} bytes`);
  console.log(`- Chunk files: ${current.chunkCount}`);

  if (failures.length > 0) {
    for (const issue of failures) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("Bundle budgets passed.");
}

main().catch((error) => {
  console.error("Bundle budget check failed:", error);
  process.exit(1);
});
