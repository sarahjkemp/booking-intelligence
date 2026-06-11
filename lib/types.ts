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

export type ArtistRecord = {
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

export type ScoredArtist = {
  artist: ArtistRecord;
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
