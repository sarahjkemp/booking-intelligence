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
  researchStatus?: "manual_curated" | "desk_research" | "fallback";
  confidenceTier?: "high" | "medium" | "low";
  bookerNotes?: string[];
  estimatedFeeRange: {
    min: number;
    max: number;
    currency: "GBP";
  };
  estimatedDraw: {
    min: number;
    max: number;
  };
  localDemandScore: number;
  momentumScore: number;
  recentNearbyEvents: string[];
  overexposureRisk?: {
    score: number;
    label: "low" | "medium" | "high";
    notes?: string[];
  };
  citySignals?: Array<{
    city: string;
    score: number;
    source: "spotify" | "bandsintown" | "resident-advisor" | "manual";
    note?: string;
  }>;
  comparableVenues?: Array<{
    city: string;
    venue: string;
    capacity: number;
    note: string;
  }>;
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
