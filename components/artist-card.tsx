import type { ScoredArtist } from "@/lib/types";

type ArtistCardProps = {
  result: ScoredArtist;
};

function formatFollowers(followers: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(followers);
}

export function ArtistCard({ result }: ArtistCardProps) {
  const { artist } = result;
  const verdictClass =
    result.verdict === "Book"
      ? "verdictPill verdictBook"
      : result.verdict === "Watch"
        ? "verdictPill verdictWatch"
        : "verdictPill verdictPass";

  return (
    <article className="artistCard">
      <div className="artistCardTop">
        <div>
          <p className="rankPill">Rank #{result.rank}</p>
          <h3>{artist.name}</h3>
          <p className="muted">
            {artist.genres.join(" / ")} · Based in {artist.homeCity}
          </p>
        </div>
        <div className="scoreBlock">
          <span>Commercial booking score</span>
          <strong>{result.totalScore}</strong>
          <p className={verdictClass}>{result.verdict}</p>
        </div>
      </div>

      <div className="signalGrid">
        <div>
          <span>Expected turnout</span>
          <strong>
            {result.expectedTicketsLow}-{result.expectedTicketsHigh}
          </strong>
          <p>
            {result.expectedFillLow}-{result.expectedFillHigh}% of capacity
          </p>
        </div>
        <div>
          <span>Local draw</span>
          <strong>{result.demandScore}/100</strong>
        </div>
        <div>
          <span>Room fit</span>
          <strong>{result.capacityFitScore}/100</strong>
        </div>
        <div>
          <span>Fee fit</span>
          <strong>{result.budgetFitScore}/100</strong>
        </div>
      </div>

      <div className="metaGrid">
        <div className="metaCard">
          <span>Audience proxy</span>
          <strong>Spotify popularity {artist.spotifyPopularity}/100</strong>
          <p>{formatFollowers(artist.spotifyFollowers)} follower signal</p>
        </div>
        <div className="metaCard">
          <span>Social response proxy</span>
          <strong>{artist.instagramEngagementRate}% engagement</strong>
          <p>Mock signal for current audience responsiveness</p>
        </div>
        <div className="metaCard">
          <span>Market proof</span>
          <strong>{result.eventHistoryScore}/100</strong>
          <p>{artist.recentNearbyEvents[0]}</p>
        </div>
      </div>

      <div className="historyBlock">
        <span>Recent nearby activity</span>
        <ul>
          {artist.recentNearbyEvents.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      </div>

      <div className="whyBlock">
        <span>Commercial read</span>
        <p>{result.commercialSummary}</p>
      </div>
    </article>
  );
}
