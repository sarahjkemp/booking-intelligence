import { parseCsv, parseNumber, readDataFile } from "@/lib/services/serviceUtils";

type InstagramManualRecord = {
  artistName: string;
  instagramFollowers: number;
  instagramEngagementRate: number;
};

export async function getInstagramManualMetrics(artistName: string): Promise<InstagramManualRecord | null> {
  const csv = await readDataFile("data/manual/instagram-manual.csv");
  const rows = parseCsv(csv);

  const match = rows.find((row) => row.artistName.toLowerCase() === artistName.toLowerCase());

  if (!match) {
    return null;
  }

  return {
    artistName: match.artistName,
    instagramFollowers: parseNumber(match.instagramFollowers),
    instagramEngagementRate: parseNumber(match.instagramEngagementRate),
  };
}
