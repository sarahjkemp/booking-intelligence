export const genreOptions = [
  "indie",
  "electronic",
  "jazz",
  "hip-hop",
  "punk",
  "pop",
  "folk",
  "experimental",
] as const;

export type Genre = (typeof genreOptions)[number];

export type ArtistSeedRecord = {
  id: string;
  name: string;
  genres: Genre[];
  homeCity: string;
  baseFeeMin: number;
  baseFeeMax: number;
  preferredCapacityMin: number;
  preferredCapacityMax: number;
  localDemandByCity: Record<string, number>;
  momentumScore: number;
  nearbyEventHistoryScore: number;
  spotifyPopularity: number;
  spotifyFollowers: number;
  instagramEngagementRate: number;
  recentNearbyEvents: string[];
  notes: string;
};

export type SearchInput = {
  city: string;
  capacity: number;
  date: string;
  genres: Genre[];
  budgetMin: number;
  budgetMax: number;
};

export type CitySignal = {
  city: string;
  score: number;
  source: "seed" | "bandsintown" | "resident-advisor";
  eventCount?: number;
};

export type VenueCapacityHistoryEntry = {
  city: string;
  venue: string;
  capacity: number;
  date: string;
  source: "bandsintown" | "resident-advisor";
};

export type EstimatedFeeRange = {
  min: number;
  max: number;
  currency: "GBP";
};

export type ArtistDemandProfile = {
  artistName: string;
  genre: string;
  genreTags: string[];
  homeCity: string;
  citySignals: CitySignal[];
  spotifyFollowers: number;
  spotifyPopularity: number;
  instagramFollowers: number;
  instagramEngagementRate: number;
  recentNearbyEvents: string[];
  lastPlayedCityDate: string | null;
  venueCapacityHistory: VenueCapacityHistoryEntry[];
  estimatedFeeRange: EstimatedFeeRange;
  momentumScore: number;
  localDemandScore: number;
  notes: string;
};

export type ScoredArtist = {
  artist: ArtistDemandProfile;
  rank: number;
  totalScore: number;
  verdict: "Book" | "Watch" | "Pass";
  demandScore: number;
  genreScore: number;
  capacityFitScore: number;
  momentumScore: number;
  eventHistoryScore: number;
  budgetFitScore: number;
  expectedTicketsLow: number;
  expectedTicketsHigh: number;
  expectedFillLow: number;
  expectedFillHigh: number;
  commercialSummary: string;
};
