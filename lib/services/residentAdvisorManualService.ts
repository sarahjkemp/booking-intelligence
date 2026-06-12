import type { CitySignal, VenueCapacityHistoryEntry } from "@/lib/types";
import {
  parseCsv,
  parseNumber,
  readDataFile,
  splitPipeList,
} from "@/lib/services/serviceUtils";

type ResidentAdvisorManualRecord = {
  artistName: string;
  momentumAdjustment: number;
  localDemandAdjustment: number;
  recentNearbyEvents: string[];
  lastPlayedCityDate: string | null;
  venueCapacityHistory: VenueCapacityHistoryEntry[];
  citySignals: CitySignal[];
};

function parseVenueCapacityHistory(value: string | undefined): VenueCapacityHistoryEntry[] {
  return splitPipeList(value).map((entry) => {
    const [city, venue, capacity, date] = entry.split(";");

    return {
      city: city ?? "",
      venue: venue ?? "Manual venue",
      capacity: parseNumber(capacity, 0),
      date: date ?? "",
      source: "resident-advisor",
    };
  });
}

function parseCitySignals(value: string | undefined): CitySignal[] {
  return splitPipeList(value).map((entry) => {
    const [city, score] = entry.split(":");

    return {
      city: (city ?? "").toLowerCase(),
      score: parseNumber(score, 0),
      source: "resident-advisor",
    };
  });
}

export async function getResidentAdvisorManualData(
  artistName: string
): Promise<ResidentAdvisorManualRecord | null> {
  const csv = await readDataFile("data/manual/resident-advisor-manual.csv");
  const rows = parseCsv(csv);

  const match = rows.find((row) => row.artistName.toLowerCase() === artistName.toLowerCase());

  if (!match) {
    return null;
  }

  return {
    artistName: match.artistName,
    momentumAdjustment: parseNumber(match.momentumAdjustment),
    localDemandAdjustment: parseNumber(match.localDemandAdjustment),
    recentNearbyEvents: splitPipeList(match.recentNearbyEvents),
    lastPlayedCityDate: match.lastPlayedCityDate || null,
    venueCapacityHistory: parseVenueCapacityHistory(match.venueCapacityHistory),
    citySignals: parseCitySignals(match.citySignals),
  };
}
