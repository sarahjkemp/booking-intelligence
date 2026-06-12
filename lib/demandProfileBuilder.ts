import artistData from "@/data/artists.json";
import { extractBandsintownLocationSignals, lookupBandsintownArtistEvents } from "@/lib/services/bandsintownService";
import { getInstagramManualMetrics } from "@/lib/services/instagramManualService";
import { getResidentAdvisorManualData } from "@/lib/services/residentAdvisorManualService";
import { enrichSpotifyArtistProfile } from "@/lib/services/spotifyService";
import type {
  ArtistDemandProfile,
  ArtistSeedRecord,
  CitySignal,
  VenueCapacityHistoryEntry,
} from "@/lib/types";

const artistSeeds = artistData as unknown as ArtistSeedRecord[];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function mergeCitySignals(baseSignals: CitySignal[], extraSignals: CitySignal[]) {
  const signalMap = new Map<string, CitySignal>();

  for (const signal of [...baseSignals, ...extraSignals]) {
    const existing = signalMap.get(signal.city);

    if (!existing) {
      signalMap.set(signal.city, signal);
      continue;
    }

    signalMap.set(signal.city, {
      city: signal.city,
      score: clamp(Math.round((existing.score + signal.score) / 2)),
      source: signal.source,
      eventCount: (existing.eventCount ?? 0) + (signal.eventCount ?? 0) || undefined,
    });
  }

  return [...signalMap.values()].sort((left, right) => right.score - left.score);
}

function dedupeVenueHistory(entries: VenueCapacityHistoryEntry[]) {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = `${entry.city}-${entry.venue}-${entry.capacity}-${entry.date}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function buildArtistDemandProfiles() {
  return Promise.all(
    artistSeeds.map(async (artist) => {
      const [spotifyProfile, bandsintownEvents, instagramMetrics, residentAdvisorData] =
        await Promise.all([
          enrichSpotifyArtistProfile(artist.name),
          lookupBandsintownArtistEvents(artist.name),
          getInstagramManualMetrics(artist.name),
          getResidentAdvisorManualData(artist.name),
        ]);

      const bandsintownSignals = extractBandsintownLocationSignals(bandsintownEvents);
      const seedCitySignals: CitySignal[] = Object.entries(artist.localDemandByCity).map(([city, score]) => ({
        city,
        score,
        source: "seed",
      }));

      const mergedCitySignals = mergeCitySignals(seedCitySignals, [
        ...bandsintownSignals.citySignals,
        ...(residentAdvisorData?.citySignals ?? []),
      ]);

      const venueCapacityHistory = dedupeVenueHistory([
        ...bandsintownSignals.venueCapacityHistory,
        ...(residentAdvisorData?.venueCapacityHistory ?? []),
      ]);

      const recentNearbyEvents = [
        ...artist.recentNearbyEvents,
        ...bandsintownSignals.recentNearbyEvents,
        ...(residentAdvisorData?.recentNearbyEvents ?? []),
      ].filter(Boolean);

      const averageSignal =
        mergedCitySignals.reduce((sum, signal) => sum + signal.score, 0) /
          Math.max(mergedCitySignals.length, 1) +
        (residentAdvisorData?.localDemandAdjustment ?? 0);

      const instagramFollowers = instagramMetrics?.instagramFollowers ?? Math.round(artist.spotifyFollowers * 0.62);
      const instagramEngagementRate =
        instagramMetrics?.instagramEngagementRate ?? artist.instagramEngagementRate;
      const spotifyPopularity = spotifyProfile.spotifyPopularity || artist.spotifyPopularity;
      const spotifyFollowers = spotifyProfile.spotifyFollowers || artist.spotifyFollowers;

      const momentumScore = clamp(
        artist.momentumScore * 0.65 +
          spotifyPopularity * 0.2 +
          instagramEngagementRate * 3 +
          (residentAdvisorData?.momentumAdjustment ?? 0)
      );

      const profile: ArtistDemandProfile = {
        artistName: artist.name,
        genre: spotifyProfile.spotifyGenres[0] ?? artist.genres[0],
        genreTags: spotifyProfile.spotifyGenres.length > 0 ? spotifyProfile.spotifyGenres : artist.genres,
        homeCity: artist.homeCity,
        citySignals: mergedCitySignals,
        spotifyFollowers,
        spotifyPopularity,
        instagramFollowers,
        instagramEngagementRate,
        recentNearbyEvents: [...new Set(recentNearbyEvents)].slice(0, 4),
        lastPlayedCityDate:
          bandsintownSignals.lastPlayedCityDate ?? residentAdvisorData?.lastPlayedCityDate ?? null,
        venueCapacityHistory,
        estimatedFeeRange: {
          min: artist.baseFeeMin,
          max: artist.baseFeeMax,
          currency: "GBP",
        },
        momentumScore,
        localDemandScore: clamp(Math.round(averageSignal)),
        notes: artist.notes,
      };

      return profile;
    })
  );
}
