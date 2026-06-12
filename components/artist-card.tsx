type RecommendationArtist = {
  artistName: string;
  genre: string;
  genres: string[];
  spotifyFollowers: number | null;
  spotifyPopularity: number | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
  catalogueStatus: "curated" | "spotify_enriched" | "fallback";
  estimatedFeeRange: {
    min: number;
    max: number;
  };
  localDemandScore: number;
  recentNearbyEvents: string[];
};

type RecommendationResult = {
  rank: number;
  totalScore: number;
  demandScore: number;
  scoreBreakdown: {
    genreFit: number;
    venueCapacityFit: number;
    commercialMomentum: number;
    localRelevance: number;
    dataConfidence: number;
    overexposurePenalty: number;
  };
  rationale: string;
  explanation: string[];
  confidenceLabel: "High" | "Medium" | "Low";
  limitedData: boolean;
  artist: RecommendationArtist;
};

type ArtistCardProps = {
  result: RecommendationResult;
  featured?: boolean;
};

function formatFollowers(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function labelForStatus(status: RecommendationArtist["catalogueStatus"]) {
  if (status === "spotify_enriched") {
    return "Spotify data";
  }

  if (status === "fallback") {
    return "Fallback";
  }

  return "Curated";
}

export function ArtistCard({ result, featured = false }: ArtistCardProps) {
  const { artist } = result;

  return (
    <article className={featured ? "artistCard featuredCard" : "artistCard compactCard"}>
      <div className="artistHeader">
        <div>
          <p className="rankPill">{featured ? "Best fit" : `Rank ${result.rank}`}</p>
          <h3>{artist.artistName}</h3>
          <p className="artistMeta">
            {artist.genre} · {labelForStatus(artist.catalogueStatus)} · {result.confidenceLabel} confidence
          </p>
        </div>
        <div className="scoreBadgeWrap">
          <div className="scoreBadge">{Math.round(result.totalScore)}</div>
        </div>
      </div>

      <div className="headlineStrip">
        <div className="headlineTile">
          <span>Genre fit</span>
          <strong>{result.scoreBreakdown.genreFit}/25</strong>
        </div>
        <div className="headlineTile">
          <span>Room fit</span>
          <strong>{result.scoreBreakdown.venueCapacityFit}/25</strong>
        </div>
        <div className="headlineTile">
          <span>Momentum</span>
          <strong>{result.scoreBreakdown.commercialMomentum}/20</strong>
        </div>
        <div className="headlineTile">
          <span>Data confidence</span>
          <strong>{result.scoreBreakdown.dataConfidence}/10</strong>
        </div>
      </div>

      <p className="commercialLine">{result.rationale}</p>

      <div className="reasonRow">
        {result.explanation.slice(0, 2).map((line) => (
          <div key={line} className="reasonChip">
            {line}
          </div>
        ))}
      </div>

      <div className="reasonRow">
        <div className="reasonChip">Local {result.scoreBreakdown.localRelevance}/20</div>
        <div className="reasonChip">Risk -{result.scoreBreakdown.overexposurePenalty}</div>
        <div className="reasonChip">
          Fee {artist.estimatedFeeRange.min}-{artist.estimatedFeeRange.max}
        </div>
        {result.limitedData ? <div className="reasonChip">Limited data</div> : null}
        {artist.recentNearbyEvents[0] ? (
          <div className="reasonChip">{artist.recentNearbyEvents[0]}</div>
        ) : null}
      </div>

      <div className="reasonRow">
        <div className="reasonChip">
          Audience {artist.spotifyPopularity ?? "N/A"}
        </div>
        <div className="reasonChip">
          Reach {typeof artist.spotifyFollowers === "number" ? formatFollowers(artist.spotifyFollowers) : "N/A"}
        </div>
        <div className="reasonChip">Demand {result.demandScore}</div>
      </div>
    </article>
  );
}
