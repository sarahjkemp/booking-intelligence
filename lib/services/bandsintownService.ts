import bandsintownEventMocks from "@/data/mock/bandsintown-events.json";
import type { CitySignal, VenueCapacityHistoryEntry } from "@/lib/types";
import { dedupeStrings } from "@/lib/services/serviceUtils";

export type BandsintownEvent = {
  id: string;
  artistName: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region?: string;
    country?: string;
    capacity?: number;
  };
};

type BandsintownEventMock = {
  artistName: string;
  events: BandsintownEvent[];
};

function getMockEvents() {
  return bandsintownEventMocks as BandsintownEventMock[];
}

export async function lookupBandsintownArtistEvents(artistName: string) {
  const appId = process.env.BANDSINTOWN_APP_ID;

  if (!appId) {
    return (
      getMockEvents().find((artist) => artist.artistName.toLowerCase() === artistName.toLowerCase())
        ?.events ?? []
    );
  }

  // Inference from common public Bandsintown REST usage:
  // GET https://rest.bandsintown.com/artists/{artist}/events?app_id={appId}
  // This adapter is intentionally isolated so the request shape can be swapped later
  // without changing the demand-profile or scoring layers.
  const url = new URL(
    `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events`
  );
  url.searchParams.set("app_id", appId);

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return (
        getMockEvents().find((artist) => artist.artistName.toLowerCase() === artistName.toLowerCase())
          ?.events ?? []
      );
    }

    const payload = (await response.json()) as Array<{
      id?: string | number;
      datetime?: string;
      venue?: {
        name?: string;
        city?: string;
        region?: string;
        country?: string;
        capacity?: number;
      };
    }>;

    return payload.map((event) => ({
      id: String(event.id ?? `${artistName}-${event.datetime}`),
      artistName,
      datetime: event.datetime ?? "",
      venue: {
        name: event.venue?.name ?? "Unknown venue",
        city: event.venue?.city ?? "Unknown city",
        region: event.venue?.region,
        country: event.venue?.country,
        capacity: event.venue?.capacity,
      },
    }));
  } catch {
    return (
      getMockEvents().find((artist) => artist.artistName.toLowerCase() === artistName.toLowerCase())
        ?.events ?? []
    );
  }
}

export function extractBandsintownLocationSignals(events: BandsintownEvent[]) {
  const cityCounts = new Map<string, number>();

  for (const event of events) {
    const normalizedCity = event.venue.city.trim().toLowerCase();
    cityCounts.set(normalizedCity, (cityCounts.get(normalizedCity) ?? 0) + 1);
  }

  const citySignals: CitySignal[] = [...cityCounts.entries()].map(([city, count]) => ({
    city,
    score: Math.min(95, 48 + count * 14),
    source: "bandsintown",
    eventCount: count,
  }));

  const recentNearbyEvents = dedupeStrings(
    events
      .slice(0, 3)
      .map((event) => `${event.venue.name} in ${event.venue.city}`)
  );

  const sortedEvents = [...events].sort((left, right) =>
    right.datetime.localeCompare(left.datetime)
  );
  const lastPlayed = sortedEvents[0];

  const venueCapacityHistory: VenueCapacityHistoryEntry[] = events
    .filter((event) => Number.isFinite(event.venue.capacity))
    .map((event) => ({
      city: event.venue.city,
      venue: event.venue.name,
      capacity: Number(event.venue.capacity),
      date: event.datetime.slice(0, 10),
      source: "bandsintown",
    }));

  return {
    citySignals,
    recentNearbyEvents,
    lastPlayedCityDate: lastPlayed ? `${lastPlayed.venue.city}|${lastPlayed.datetime.slice(0, 10)}` : null,
    venueCapacityHistory,
  };
}
