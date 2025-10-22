import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dataPath = resolve(__dirname, "../..", "data", "briefSubmissions.json");

const ensureDataFile = async () => {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, "[]", "utf8");
  }
};

export const saveBrief = async (payload) => {
  await ensureDataFile();
  const timestamp = new Date().toISOString();
  const entry = { id: nanoid(), timestamp, ...payload };
  const file = await fs.readFile(dataPath, "utf8");
  const entries = JSON.parse(file);
  entries.unshift(entry);
  await fs.writeFile(dataPath, JSON.stringify(entries, null, 2), "utf8");
  return entry;
};
