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
  rationale: string;
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
            {artist.genre} · {labelForStatus(artist.catalogueStatus)}
          </p>
        </div>
        <div className="scoreBadgeWrap">
          <div className="scoreBadge">{Math.round(result.totalScore)}</div>
        </div>
      </div>

      <div className="headlineStrip">
        <div className="headlineTile">
          <span>Demand score</span>
          <strong>{result.demandScore}</strong>
        </div>
        <div className="headlineTile">
          <span>Audience</span>
          <strong>{artist.spotifyPopularity ?? "N/A"}</strong>
        </div>
        <div className="headlineTile">
          <span>Reach</span>
          <strong>
            {typeof artist.spotifyFollowers === "number" ? formatFollowers(artist.spotifyFollowers) : "N/A"}
          </strong>
        </div>
      </div>

      <p className="commercialLine">{result.rationale}</p>

      <div className="reasonRow">
        <div className="reasonChip">
          Fee {artist.estimatedFeeRange.min}-{artist.estimatedFeeRange.max}
        </div>
        <div className="reasonChip">
          Local demand {artist.localDemandScore}
        </div>
        {artist.recentNearbyEvents[0] ? (
          <div className="reasonChip">{artist.recentNearbyEvents[0]}</div>
        ) : null}
      </div>
    </article>
  );
}
