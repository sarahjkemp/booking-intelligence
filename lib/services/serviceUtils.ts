import { readFile } from "node:fs/promises";
import path from "node:path";

type CsvRow = Record<string, string>;

export async function readDataFile(relativePath: string) {
  const absolutePath = path.join(process.cwd(), relativePath);
  return readFile(absolutePath, "utf8");
}

export function parseCsv(text: string): CsvRow[] {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  const [headerLine, ...lines] = trimmed.split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim());

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.split(",").map((value) => value.trim());
      return headers.reduce<CsvRow>((row, header, index) => {
        row[header] = values[index] ?? "";
        return row;
      }, {});
    });
}

export function parseNumber(value: string | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function splitPipeList(value: string | undefined) {
  return (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}
