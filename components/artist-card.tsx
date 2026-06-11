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
          <span>Demand-led score</span>
          <strong>{result.totalScore}</strong>
        </div>
      </div>

      <div className="signalGrid">
        <div>
          <span>Estimated local demand</span>
          <strong>{result.demandScore}/100</strong>
        </div>
        <div>
          <span>Venue size fit</span>
          <strong>{result.capacityFitScore}/100</strong>
        </div>
        <div>
          <span>Budget fit</span>
          <strong>{result.budgetFitScore}/100</strong>
        </div>
        <div>
          <span>Recent momentum</span>
          <strong>{result.momentumScore}/100</strong>
        </div>
      </div>

      <div className="metaGrid">
        <div className="metaCard">
          <span>Spotify placeholder</span>
          <strong>Popularity {artist.spotifyPopularity}/100</strong>
          <p>{formatFollowers(artist.spotifyFollowers)} followers</p>
        </div>
        <div className="metaCard">
          <span>Instagram placeholder</span>
          <strong>{artist.instagramEngagementRate}% engagement</strong>
          <p>Mock proxy for recent audience response</p>
        </div>
        <div className="metaCard">
          <span>Nearby event history</span>
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
        <span>Why this artist is recommended</span>
        <p>{result.whyRecommended}</p>
      </div>
    </article>
  );
}
