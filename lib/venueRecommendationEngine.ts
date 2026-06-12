import type { ArtistDatabaseRecord, VenueDatabaseRecord } from "@/lib/db/schema";

export type VenueRecommendationInput = {
  venueName?: string;
  city: string;
  capacity: number;
  date: string;
  genre: string;
};

export type VenueRecommendation = {
  rank: number;
  artist: ArtistDatabaseRecord;
  totalScore: number;
  demandScore: number;
  rationale: string;
};

const WEIGHTS = {
  spotifyPopularity: 0.3,
  spotifyFollowers: 0.2,
  genreFit: 0.2,
  venueCapacityFit: 0.15,
  momentumScore: 0.15,
};

const GENRE_FAMILIES: Record<string, string[]> = {
  alternative: ["alternative", "indie", "rock"],
  indie: ["indie", "alternative"],
  rock: ["rock", "alternative", "indie", "punk"],
  punk: ["punk", "rock"],
  electronic: ["electronic", "house", "techno"],
  house: ["house", "electronic"],
  techno: ["techno", "electronic"],
  "hip hop": ["hip hop", "rap", "grime"],
  "r&b": ["r&b", "rnb", "soul"],
  afrobeats: ["afrobeats", "global"],
};

const SOURCE_PRIORITY: Record<ArtistDatabaseRecord["catalogueStatus"], number> = {
  spotify_enriched: 2,
  curated: 1,
  fallback: 0,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeFollowers(followers: number) {
  const score = Math.log10(Math.max(followers, 1)) * 20;
  return clamp(Math.round(score));
}

function getPopularityScore(artist: ArtistDatabaseRecord) {
  if (typeof artist.spotifyPopularity === "number") {
    return artist.spotifyPopularity;
  }

  return clamp(Math.round(artist.localDemandScore * 0.75 + artist.momentumScore * 0.25));
}

function getFollowerScore(artist: ArtistDatabaseRecord) {
  if (typeof artist.spotifyFollowers === "number") {
    return normalizeFollowers(artist.spotifyFollowers);
  }

  return clamp(Math.round(artist.localDemandScore * 0.8));
}

function normalizeGenre(value: string) {
  return value.toLowerCase().replace(/&/g, "and").trim();
}

function getGenreAliases(genre: string) {
  const normalized = normalizeGenre(genre);
  return new Set([normalized, ...(GENRE_FAMILIES[normalized] ?? [])].map(normalizeGenre));
}

function isGenreMatch(artist: ArtistDatabaseRecord, requestedGenre: string, venue?: VenueDatabaseRecord) {
  const requestedAliases = getGenreAliases(requestedGenre);
  const artistGenres = [artist.genre, ...artist.genres].map(normalizeGenre);

  return artistGenres.some((genre) => requestedAliases.has(genre));
}

function scoreGenreFit(artistGenre: string, requestedGenre: string, venue?: VenueDatabaseRecord) {
  const normalizedArtist = normalizeGenre(artistGenre);
  const normalizedRequested = normalizeGenre(requestedGenre);
  const requestedAliases = getGenreAliases(requestedGenre);

  if (requestedAliases.has(normalizedArtist)) {
    return 100;
  }

  if (normalizedArtist.includes(normalizedRequested) || normalizedRequested.includes(normalizedArtist)) {
    return 72;
  }

  return 8;
}

function scoreVenueCapacityFit(
  capacityFit: ArtistDatabaseRecord["venueCapacityFit"],
  requestedCapacity: number
) {
  if (requestedCapacity >= capacityFit.min && requestedCapacity <= capacityFit.max) {
    return 96;
  }

  const midpoint = (capacityFit.min + capacityFit.max) / 2;
  const spread = Math.max((capacityFit.max - capacityFit.min) / 2, 75);
  const distance = Math.abs(requestedCapacity - midpoint);

  return clamp(100 - (distance / spread) * 40, 25, 96);
}

function buildRationale(
  artist: ArtistDatabaseRecord,
  popularityScore: number,
  followerScore: number,
  genreFitScore: number,
  venueCapacityFitScore: number,
  momentumScore: number
) {
  const reasons: string[] = [];

  if (popularityScore >= 75) {
    reasons.push("strong audience signal");
  }

  if (followerScore >= 75) {
    reasons.push("solid following");
  }

  if (genreFitScore >= 90) {
    reasons.push("clear genre fit");
  }

  if (venueCapacityFitScore >= 88) {
    reasons.push("good room-size fit");
  }

  if (momentumScore >= 75) {
    reasons.push("healthy momentum");
  }

  if (reasons.length === 0) {
    reasons.push("balanced across the key commercial signals");
  }

  return `${artist.artistName} scores well because of ${reasons.join(", ")}.`;
}

export function recommendArtistsForVenue(args: {
  artists: ArtistDatabaseRecord[];
  venues: VenueDatabaseRecord[];
  input: VenueRecommendationInput;
}) {
  const { artists, venues, input } = args;
  const matchedVenue = input.venueName
    ? venues.find((venue) => venue.venueName === input.venueName)
    : undefined;
  const preferredArtists = artists.some((artist) => artist.catalogueStatus !== "fallback")
    ? artists.filter((artist) => artist.catalogueStatus !== "fallback")
    : artists;
  const genreMatchedArtists = preferredArtists.filter((artist) =>
    isGenreMatch(artist, input.genre, matchedVenue)
  );
  const scoringPool = genreMatchedArtists.length > 0 ? genreMatchedArtists : preferredArtists;

  return scoringPool
    .map((artist) => {
      const popularityScore = getPopularityScore(artist);
      const followerScore = getFollowerScore(artist);
      const genreFitScore = scoreGenreFit(artist.genre, input.genre, matchedVenue);
      const venueCapacityFitScore = scoreVenueCapacityFit(artist.venueCapacityFit, input.capacity);
      const momentumScore = artist.momentumScore;

      const totalScore =
        popularityScore * WEIGHTS.spotifyPopularity +
        followerScore * WEIGHTS.spotifyFollowers +
        genreFitScore * WEIGHTS.genreFit +
        venueCapacityFitScore * WEIGHTS.venueCapacityFit +
        momentumScore * WEIGHTS.momentumScore;

      return {
        artist,
        totalScore: Number(totalScore.toFixed(1)),
        demandScore: artist.localDemandScore,
        rationale: buildRationale(
          artist,
          popularityScore,
          followerScore,
          genreFitScore,
          venueCapacityFitScore,
          momentumScore
        ),
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
