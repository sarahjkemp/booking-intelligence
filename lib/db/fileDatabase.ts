import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArtistDatabaseRecord, VenueDatabaseRecord } from "@/lib/db/schema";

const dataDirectory = path.join(process.cwd(), "data", "db");

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(dataDirectory, fileName);
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

async function writeJsonFile<T>(fileName: string, payload: T) {
  const filePath = path.join(dataDirectory, fileName);
  await writeFile(filePath, JSON.stringify(payload, null, 2));
}

export async function getArtistDatabase() {
  return readJsonFile<ArtistDatabaseRecord[]>("artists.json");
}

export async function saveArtistDatabase(records: ArtistDatabaseRecord[]) {
  await writeJsonFile("artists.json", records);
}

export async function getVenueDatabase() {
  return readJsonFile<VenueDatabaseRecord[]>("venues.json");
}

export async function saveVenueDatabase(records: VenueDatabaseRecord[]) {
  await writeJsonFile("venues.json", records);
}
