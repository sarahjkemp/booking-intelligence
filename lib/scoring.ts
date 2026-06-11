import artistData from "@/data/artists.json";
import type { ArtistRecord, ScoredArtist, SearchInput } from "@/lib/types";

const artists = artistData as unknown as ArtistRecord[];

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

function scoreGenreMatch(artist: ArtistRecord, requestedGenres: SearchInput["genres"]) {
  if (requestedGenres.length === 0) {
    return 65;
  }

  const matches = requestedGenres.filter((genre) => artist.genres.includes(genre)).length;
  return clamp((matches / requestedGenres.length) * 100);
}

function scoreCapacityFit(artist: ArtistRecord, capacity: number) {
  const { preferredCapacityMin, preferredCapacityMax } = artist;

  if (capacity >= preferredCapacityMin && capacity <= preferredCapacityMax) {
    return 95;
  }

  const midpoint = (preferredCapacityMin + preferredCapacityMax) / 2;
  const distance = Math.abs(capacity - midpoint);
  const spread = Math.max((preferredCapacityMax - preferredCapacityMin) / 2, 60);
  return clamp(100 - (distance / spread) * 45, 20, 95);
}

function scoreBudgetFit(artist: ArtistRecord, budgetMin: number, budgetMax: number) {
  const artistMid = (artist.baseFeeMin + artist.baseFeeMax) / 2;

  if (budgetMax >= artist.baseFeeMin && budgetMin <= artist.baseFeeMax) {
    return 92;
  }

  if (artistMid < budgetMin) {
    return clamp(85 - ((budgetMin - artistMid) / Math.max(budgetMin, 1)) * 45, 35, 85);
  }

  return clamp(88 - ((artistMid - budgetMax) / Math.max(budgetMax, 1)) * 60, 10, 88);
}

function scoreLocalDemand(artist: ArtistRecord, city: string) {
  const normalizedCity = city.trim().toLowerCase();

  if (artist.localDemandByCity[normalizedCity]) {
    return artist.localDemandByCity[normalizedCity];
  }

  const allCityScores = Object.values(artist.localDemandByCity);
  const average = allCityScores.reduce((sum, value) => sum + value, 0) / allCityScores.length;
  return clamp(average - 10, 35, 80);
}

function buildCommercialSummary(
  artist: ArtistRecord,
  city: string,
  demandScore: number,
  genreScore: number,
  capacityFitScore: number,
  budgetFitScore: number
) {
  const reasons: string[] = [];
  const normalizedCity = city.trim();

  if (demandScore >= 80) {
    reasons.push(`strong local demand signal around ${normalizedCity}`);
  } else if (demandScore >= 65) {
    reasons.push(`credible interest signal around ${normalizedCity}`);
  }

  if (genreScore >= 80) {
    reasons.push("clear genre alignment");
  }

  if (capacityFitScore >= 85) {
    reasons.push("well matched to your room size");
  }

  if (budgetFitScore >= 85) {
    reasons.push("comfortably within budget range");
  }

  if (reasons.length === 0) {
    reasons.push("balanced across demand, venue fit and budget");
  }

  return `Commercially attractive because of ${reasons.join(", ")}. ${artist.notes}`;
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

export function getRecommendations(input: SearchInput): ScoredArtist[] {
  const ranked = artists.map((artist) => {
    const demandScore = scoreLocalDemand(artist, input.city);
    const genreScore = scoreGenreMatch(artist, input.genres);
    const capacityFitScore = scoreCapacityFit(artist, input.capacity);
    const budgetFitScore = scoreBudgetFit(artist, input.budgetMin, input.budgetMax);
    const momentumScore = artist.momentumScore;
    const eventHistoryScore = artist.nearbyEventHistoryScore;

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
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 6)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}

// Future integration notes:
// - Spotify API: replace spotifyPopularity and spotifyFollowers placeholders with live audience metrics.
// - Instagram Graph API or creator analytics source: replace engagement placeholders with recent local fan activity.
// - Songkick/Bandsintown: replace nearbyEventHistoryScore and recentNearbyEvents with verified ticketing/event data.
// - Resident Advisor: enrich electronic acts with regional promoter / club demand signals.
// - X API or a social listening source: add conversation velocity and announcement response trends to momentum.
// - Ticketing / venue outcome data later can calibrate turnout projections and verdict thresholds.
