export type ArtistDatabaseRecord = {
  artistName: string;
  spotifyArtistId: string | null;
  spotifyUrl: string | null;
  catalogueStatus: "curated" | "spotify_enriched" | "fallback";
  genre: string;
  genres: string[];
  spotifyFollowers: number | null;
  spotifyPopularity: number | null;
  imageUrl: string | null;
  estimatedFeeRange: {
    min: number;
    max: number;
    currency: "GBP";
  };
  localDemandScore: number;
  momentumScore: number;
  recentNearbyEvents: string[];
  venueCapacityFit: {
    min: number;
    max: number;
  };
  futureSignals?: {
    bandsintownEventHistoryReady?: boolean;
    residentAdvisorReady?: boolean;
  };
};

export type VenueDatabaseRecord = {
  venueName: string;
  city: string;
  capacity: number;
  genreFocus: string[];
};
