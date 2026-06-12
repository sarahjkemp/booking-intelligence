import type { ArtistDatabaseRecord, VenueDatabaseRecord } from "@/lib/db/schema";

export type VenueRecommendationInput = {
  venueName?: string;
  city: string;
  capacity: number;
  date: string;
  genre: string;
};

export type ScoreBreakdown = {
  genreFit: number;
  venueCapacityFit: number;
  commercialMomentum: number;
  localRelevance: number;
  dataConfidence: number;
};

export type VenueRecommendation = {
  rank: number;
  artist: ArtistDatabaseRecord;
  totalScore: number;
  demandScore: number;
  scoreBreakdown: ScoreBreakdown;
  rationale: string;
  explanation: string[];
  confidenceLabel: "High" | "Medium" | "Low";
  limitedData: boolean;
};

const MAX_POINTS = {
  genreFit: 25,
  venueCapacityFit: 25,
  commercialMomentum: 20,
  localRelevance: 20,
  dataConfidence: 10,
} as const;

const GENRE_FAMILIES: Record<string, string[]> = {
  alternative: ["alternative", "indie", "rock"],
  indie: ["indie", "alternative"],
  rock: ["rock", "alternative", "indie", "punk"],
  punk: ["punk", "rock"],
  electronic: ["electronic", "house", "techno"],
  house: ["house", "electronic"],
  techno: ["techno", "electronic"],
  "hip hop": ["hip hop", "rap", "grime"],
  rnb: ["rnb", "soul"],
  afrobeats: ["afrobeats", "global"],
};

const DATA_CONFIDENCE_POINTS: Record<ArtistDatabaseRecord["catalogueStatus"], number> = {
  spotify_enriched: 10,
  curated: 7,
  fallback: 2,
};

const SOURCE_PRIORITY: Record<ArtistDatabaseRecord["catalogueStatus"], number> = {
  spotify_enriched: 2,
  curated: 1,
  fallback: 0,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeGenre(value: string) {
  const normalized = value.toLowerCase().trim().replace(/\s+/g, " ");

  if (["hip-hop", "hip hop", "rap", "grime"].includes(normalized)) {
    return normalized === "grime" ? "grime" : "hip hop";
  }

  if (["r&b", "rnb", "rnb soul", "r and b", "randb", "soul"].includes(normalized)) {
    return normalized === "soul" ? "soul" : "rnb";
  }

  if (normalized === "afrobeats global") {
    return "afrobeats";
  }

  return normalized.replace(/&/g, "and");
}

function getGenreAliases(genre: string) {
  const normalized = normalizeGenre(genre);
  return new Set([normalized, ...(GENRE_FAMILIES[normalized] ?? [])].map(normalizeGenre));
}

function isBroadGenreMatch(artist: ArtistDatabaseRecord, requestedGenre: string) {
  const requestedAliases = getGenreAliases(requestedGenre);
  const artistAliases = new Set(
    [artist.genre, ...artist.genres]
      .map((genre) => [...getGenreAliases(genre)])
      .flat()
      .map(normalizeGenre)
  );

  return [...artistAliases].some((genre) => requestedAliases.has(genre));
}

function scoreGenreFit(artist: ArtistDatabaseRecord, requestedGenre: string) {
  const requested = normalizeGenre(requestedGenre);
  const artistGenres = [artist.genre, ...artist.genres].map(normalizeGenre);

  if (artistGenres.includes(requested)) {
    return MAX_POINTS.genreFit;
  }

  if (isBroadGenreMatch(artist, requestedGenre)) {
    return 15;
  }

  return 0;
}

function scoreVenueCapacityFit(
  capacityFit: ArtistDatabaseRecord["venueCapacityFit"],
  requestedCapacity: number
) {
  if (requestedCapacity >= capacityFit.min && requestedCapacity <= capacityFit.max) {
    return MAX_POINTS.venueCapacityFit;
  }

  const lowerBuffer = capacityFit.min * 0.2;
  const upperBuffer = capacityFit.max * 0.2;
  const slightlyBelow =
    requestedCapacity < capacityFit.min && requestedCapacity >= capacityFit.min - lowerBuffer;
  const slightlyAbove =
    requestedCapacity > capacityFit.max && requestedCapacity <= capacityFit.max + upperBuffer;

  if (slightlyBelow || slightlyAbove) {
    return 15;
  }

  return 0;
}

function normalizeToPoints(value: number, maxPoints: number) {
  return Math.round((clamp(value) / 100) * maxPoints);
}

function getCommercialMomentum(artist: ArtistDatabaseRecord) {
  if (typeof artist.spotifyPopularity === "number") {
    return {
      points: normalizeToPoints(artist.spotifyPopularity, MAX_POINTS.commercialMomentum),
      signal: "spotify popularity" as const,
    };
  }

  return {
    points: normalizeToPoints(artist.momentumScore, MAX_POINTS.commercialMomentum),
    signal: "placeholder momentum" as const,
  };
}

function getLocalRelevance(artist: ArtistDatabaseRecord, city: string) {
  const signal = artist.citySignals?.find(
    (entry) => normalizeGenre(entry.city) === normalizeGenre(city)
  );

  if (signal) {
    return {
      points: normalizeToPoints(signal.score, MAX_POINTS.localRelevance),
      signal: "city signal" as const,
    };
  }

  return {
    points: normalizeToPoints(artist.localDemandScore, MAX_POINTS.localRelevance),
    signal: "placeholder local demand" as const,
  };
}

function getConfidenceLabel(
  totalScore: number,
  limitedData: boolean
): VenueRecommendation["confidenceLabel"] {
  if (!limitedData && totalScore >= 75) {
    return "High";
  }

  if (limitedData || totalScore < 55) {
    return "Low";
  }

  return "Medium";
}

function buildRationale(args: {
  artist: ArtistDatabaseRecord;
  scoreBreakdown: ScoreBreakdown;
  input: VenueRecommendationInput;
  limitedData: boolean;
  momentumSignal: "spotify popularity" | "placeholder momentum";
  localSignal: "city signal" | "placeholder local demand";
}) {
  const { artist, scoreBreakdown, limitedData, momentumSignal, localSignal } = args;
  const reasons: string[] = [];

  if (scoreBreakdown.genreFit === MAX_POINTS.genreFit) {
    reasons.push("exact genre match");
  } else if (scoreBreakdown.genreFit > 0) {
    reasons.push("broad genre match");
  }

  if (scoreBreakdown.venueCapacityFit === MAX_POINTS.venueCapacityFit) {
    reasons.push("good room-size fit");
  } else if (scoreBreakdown.venueCapacityFit > 0) {
    reasons.push("close to the right room size");
  }

  if (scoreBreakdown.commercialMomentum >= 14) {
    reasons.push(`strong commercial momentum from ${momentumSignal}`);
  }

  if (scoreBreakdown.localRelevance >= 14) {
    reasons.push(`good local relevance from ${localSignal}`);
  }

  const baseLine =
    reasons.length > 0
      ? `${artist.artistName} stands out because of ${reasons.join(", ")}.`
      : `${artist.artistName} is a weaker commercial fit on the current inputs.`;

  if (limitedData) {
    return `${baseLine} Limited data: some parts of this score use placeholders rather than live local or Spotify signals.`;
  }

  return baseLine;
}

function buildExplanation(
  scoreBreakdown: ScoreBreakdown,
  limitedData: boolean
) {
  const lines: string[] = [];

  if (scoreBreakdown.genreFit === MAX_POINTS.genreFit) {
    lines.push("Exact genre match for this brief.");
  } else if (scoreBreakdown.genreFit > 0) {
    lines.push("Related genre, but not a perfect match.");
  } else {
    lines.push("Genre match is weak.");
  }

  if (scoreBreakdown.venueCapacityFit === MAX_POINTS.venueCapacityFit) {
    lines.push("Estimated draw fits the room well.");
  } else if (scoreBreakdown.venueCapacityFit > 0) {
    lines.push("Draw is close to the room size, but not ideal.");
  } else {
    lines.push("Room size fit is weak.");
  }

  if (limitedData) {
    lines.push("Limited data: local or momentum inputs use placeholders.");
  }

  return lines;
}

export function recommendArtistsForVenue(args: {
  artists: ArtistDatabaseRecord[];
  venues: VenueDatabaseRecord[];
  input: VenueRecommendationInput;
}) {
  const { artists, input } = args;
  const preferredArtists = artists.some((artist) => artist.catalogueStatus !== "fallback")
    ? artists.filter((artist) => artist.catalogueStatus !== "fallback")
    : artists;
  const genreMatchedArtists = preferredArtists.filter((artist) => scoreGenreFit(artist, input.genre) > 0);
  const poolAfterGenre = genreMatchedArtists.length > 0 ? genreMatchedArtists : preferredArtists;
  const capacityMatchedArtists = poolAfterGenre.filter(
    (artist) => scoreVenueCapacityFit(artist.venueCapacityFit, input.capacity) > 0
  );
  const scoringPool = capacityMatchedArtists.length >= 4 ? capacityMatchedArtists : poolAfterGenre;

  return scoringPool
    .map((artist) => {
      const genreFit = scoreGenreFit(artist, input.genre);
      const venueCapacityFit = scoreVenueCapacityFit(artist.venueCapacityFit, input.capacity);
      const commercialMomentum = getCommercialMomentum(artist);
      const localRelevance = getLocalRelevance(artist, input.city);
      const dataConfidence = DATA_CONFIDENCE_POINTS[artist.catalogueStatus];
      const limitedData =
        artist.catalogueStatus !== "spotify_enriched" ||
        typeof artist.spotifyPopularity !== "number" ||
        !artist.citySignals?.some((entry) => normalizeGenre(entry.city) === normalizeGenre(input.city));

      const scoreBreakdown: ScoreBreakdown = {
        genreFit,
        venueCapacityFit,
        commercialMomentum: commercialMomentum.points,
        localRelevance: localRelevance.points,
        dataConfidence,
      };

      const totalScore = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);

      return {
        artist,
        totalScore,
        demandScore: artist.localDemandScore,
        scoreBreakdown,
        rationale: buildRationale({
          artist,
          scoreBreakdown,
          input,
          limitedData,
          momentumSignal: commercialMomentum.signal,
          localSignal: localRelevance.signal,
        }),
        explanation: buildExplanation(scoreBreakdown, limitedData),
        confidenceLabel: getConfidenceLabel(totalScore, limitedData),
        limitedData,
      };
    })
    .sort((left, right) => {
      const sourceDelta =
        SOURCE_PRIORITY[right.artist.catalogueStatus] - SOURCE_PRIORITY[left.artist.catalogueStatus];

      if (sourceDelta !== 0) {
        return sourceDelta;
      }

      return right.totalScore - left.totalScore;
    })
    .slice(0, 20)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}
