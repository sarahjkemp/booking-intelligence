import { buildArtistDemandProfiles } from "@/lib/demandProfileBuilder";
import type { ArtistDemandProfile, ScoredArtist, SearchInput, VenueCapacityHistoryEntry } from "@/lib/types";

const WEIGHTS = {
  localDemand: 0.3,
  genreMatch: 0.2,
  capacityFit: 0.15,
  momentum: 0.15,
  eventHistory: 0.1,
  budgetFit: 0.1,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function roundToNearestFive(value: number) {
  return Math.max(0, Math.round(value / 5) * 5);
}

function normalizeGenre(value: string) {
  return value.toLowerCase().replace(/[-\s]+/g, " ").trim();
}

function scoreGenreMatch(artist: ArtistDemandProfile, requestedGenres: SearchInput["genres"]) {
  if (requestedGenres.length === 0) {
    return 65;
  }

  const normalizedGenres = artist.genreTags.map((genre) => normalizeGenre(genre));
  const matches = requestedGenres.filter((genre) =>
    normalizedGenres.some((tag) => tag.includes(normalizeGenre(genre)))
  ).length;

  return clamp((matches / requestedGenres.length) * 100);
}

function scoreCapacityFit(venueCapacityHistory: VenueCapacityHistoryEntry[], requestedCapacity: number) {
  if (venueCapacityHistory.length === 0) {
    return 60;
  }

  const capacities = venueCapacityHistory.map((entry) => entry.capacity).sort((left, right) => left - right);
  const low = capacities[0];
  const high = capacities[capacities.length - 1];

  if (requestedCapacity >= low && requestedCapacity <= high) {
    return 94;
  }

  const midpoint = (low + high) / 2;
  const distance = Math.abs(requestedCapacity - midpoint);
  const spread = Math.max((high - low) / 2, 75);

  return clamp(100 - (distance / spread) * 40, 28, 94);
}

function scoreBudgetFit(
  estimatedFeeRange: ArtistDemandProfile["estimatedFeeRange"],
  budgetMin: number,
  budgetMax: number
) {
  const artistMid = (estimatedFeeRange.min + estimatedFeeRange.max) / 2;

  if (budgetMax >= estimatedFeeRange.min && budgetMin <= estimatedFeeRange.max) {
    return 92;
  }

  if (artistMid < budgetMin) {
    return clamp(85 - ((budgetMin - artistMid) / Math.max(budgetMin, 1)) * 45, 35, 85);
  }

  return clamp(88 - ((artistMid - budgetMax) / Math.max(budgetMax, 1)) * 60, 10, 88);
}

function scoreLocalDemand(artist: ArtistDemandProfile, city: string) {
  const normalizedCity = city.trim().toLowerCase();
  const directSignal = artist.citySignals.find((signal) => signal.city === normalizedCity);

  if (directSignal) {
    return directSignal.score;
  }

  return clamp(artist.localDemandScore - 10, 35, 82);
}

function scoreEventHistory(artist: ArtistDemandProfile) {
  const volumeScore = artist.recentNearbyEvents.length * 14;
  const capacityScore = artist.venueCapacityHistory.length * 8;
  return clamp(40 + volumeScore + capacityScore, 35, 92);
}

function buildCommercialSummary(
  artist: ArtistDemandProfile,
  city: string,
  demandScore: number,
  genreScore: number,
  capacityFitScore: number,
  budgetFitScore: number
) {
  const reasons: string[] = [];
  const normalizedCity = city.trim();

  if (demandScore >= 80) {
    reasons.push(`strong local demand around ${normalizedCity}`);
  } else if (demandScore >= 65) {
    reasons.push(`credible market pull around ${normalizedCity}`);
  }

  if (genreScore >= 80) {
    reasons.push("clear genre fit");
  }

  if (capacityFitScore >= 85) {
    reasons.push("a room size that makes sense");
  }

  if (budgetFitScore >= 85) {
    reasons.push("a fee that should work");
  }

  if (reasons.length === 0) {
    reasons.push("the overall commercial mix looks balanced");
  }

  return `${artist.artistName} looks strong because of ${reasons.join(", ")}. ${artist.notes}`;
}

function getVerdict(totalScore: number): "Book" | "Watch" | "Pass" {
  if (totalScore >= 78) {
    return "Book";
  }

  if (totalScore >= 62) {
    return "Watch";
  }

  return "Pass";
}

function projectTurnoutRange(
  capacity: number,
  totalScore: number,
  demandScore: number,
  capacityFitScore: number,
  momentumScore: number
) {
  const modeledFill = clamp(
    totalScore * 0.72 + demandScore * 0.12 + capacityFitScore * 0.1 + momentumScore * 0.06,
    24,
    96
  );
  const lowFill = clamp(modeledFill - 10, 18, 92);
  const highFill = clamp(modeledFill + 8, 25, 98);

  return {
    expectedFillLow: Math.round(lowFill),
    expectedFillHigh: Math.round(highFill),
    expectedTicketsLow: roundToNearestFive((capacity * lowFill) / 100),
    expectedTicketsHigh: roundToNearestFive((capacity * highFill) / 100),
  };
}

export async function getRecommendations(input: SearchInput): Promise<ScoredArtist[]> {
  const artistProfiles = await buildArtistDemandProfiles();

  const ranked = artistProfiles.map((artist) => {
    const demandScore = scoreLocalDemand(artist, input.city);
    const genreScore = scoreGenreMatch(artist, input.genres);
    const capacityFitScore = scoreCapacityFit(artist.venueCapacityHistory, input.capacity);
    const budgetFitScore = scoreBudgetFit(artist.estimatedFeeRange, input.budgetMin, input.budgetMax);
    const momentumScore = artist.momentumScore;
    const eventHistoryScore = scoreEventHistory(artist);

    const totalScore =
      demandScore * WEIGHTS.localDemand +
      genreScore * WEIGHTS.genreMatch +
      capacityFitScore * WEIGHTS.capacityFit +
      momentumScore * WEIGHTS.momentum +
      eventHistoryScore * WEIGHTS.eventHistory +
      budgetFitScore * WEIGHTS.budgetFit;
    const roundedTotalScore = Number(totalScore.toFixed(1));
    const turnoutProjection = projectTurnoutRange(
      input.capacity,
      roundedTotalScore,
      demandScore,
      capacityFitScore,
      momentumScore
    );

    return {
      artist,
      totalScore: roundedTotalScore,
      verdict: getVerdict(roundedTotalScore),
      demandScore,
      genreScore,
      capacityFitScore,
      momentumScore,
      eventHistoryScore,
      budgetFitScore,
      ...turnoutProjection,
      commercialSummary: buildCommercialSummary(
        artist,
        input.city,
        demandScore,
        genreScore,
        capacityFitScore,
        budgetFitScore
      ),
    };
  });

  return ranked
    .sort((left, right) => right.totalScore - left.totalScore)
    .slice(0, 6)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}
