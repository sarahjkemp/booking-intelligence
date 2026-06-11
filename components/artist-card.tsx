import type { ScoredArtist } from "@/lib/types";

type ArtistCardProps = {
  result: ScoredArtist;
  featured?: boolean;
};

function getReasons(result: ScoredArtist) {
  const reasons: string[] = [];

  if (result.demandScore >= 80) {
    reasons.push("Strong local demand");
  }

  if (result.capacityFitScore >= 85) {
    reasons.push("Good fit for your room");
  }

  if (result.budgetFitScore >= 85) {
    reasons.push("Fits the budget");
  }

  if (result.momentumScore >= 78) {
    reasons.push("Momentum looks healthy");
  }

  if (reasons.length < 3 && result.artist.recentNearbyEvents[0]) {
    reasons.push(result.artist.recentNearbyEvents[0]);
  }

  return reasons.slice(0, 3);
}

export function ArtistCard({ result, featured = false }: ArtistCardProps) {
  const { artist } = result;
  const reasons = getReasons(result);
  const verdictClass =
    result.verdict === "Book"
      ? "verdictPill verdictBook"
      : result.verdict === "Watch"
        ? "verdictPill verdictWatch"
        : "verdictPill verdictPass";

  return (
    <article className={featured ? "artistCard featuredCard" : "artistCard"}>
      <div className="artistHeader">
        <div>
          <p className="rankPill">{featured ? "Best option" : `Option ${result.rank}`}</p>
          <h3>{artist.name}</h3>
          <p className="artistMeta">
            {artist.genres.join(" / ")} · {artist.homeCity}
          </p>
        </div>
        <div className="scoreBadgeWrap">
          <div className="scoreBadge">{Math.round(result.totalScore)}</div>
          <p className={verdictClass}>{result.verdict}</p>
        </div>
      </div>

      <div className="headlineStrip">
        <div className="headlineTile">
          <span>Likely tickets</span>
          <strong>
            {result.expectedTicketsLow}-{result.expectedTicketsHigh}
          </strong>
        </div>
        <div className="headlineTile">
          <span>Likely fill</span>
          <strong>
            {result.expectedFillLow}-{result.expectedFillHigh}%
          </strong>
        </div>
        <div className="headlineTile">
          <span>Fee range</span>
          <strong>
            {artist.baseFeeMin}-{artist.baseFeeMax}
          </strong>
        </div>
      </div>

      <p className="commercialLine">{result.commercialSummary}</p>

      <div className="reasonRow">
        {reasons.map((reason) => (
          <div key={reason} className="reasonChip">
            {reason}
          </div>
        ))}
      </div>
    </article>
  );
}
