"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtistCard } from "@/components/artist-card";

type VenueRecord = {
  venueName: string;
  city: string;
  capacity: number;
  genreFocus: string[];
};

type RecommendationResult = {
  rank: number;
  totalScore: number;
  demandScore: number;
  rationale: string;
  artist: {
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
};

const genreOptions = [
  "pop",
  "indie",
  "alternative",
  "rock",
  "hip hop",
  "r&b",
  "electronic",
  "house",
  "techno",
  "jazz",
  "folk",
  "afrobeats",
  "punk"
];

export function BookingWorkbench() {
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [city, setCity] = useState("Manchester");
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState(350);
  const [genre, setGenre] = useState("indie");
  const [date, setDate] = useState("2026-09-18");
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadVenues() {
      const response = await fetch("/api/venues");
      const payload = (await response.json()) as { venues: VenueRecord[] };
      setVenues(payload.venues);
    }

    void loadVenues();
  }, []);

  const cityOptions = useMemo(
    () => [...new Set(venues.map((venue) => venue.city))].sort(),
    [venues]
  );

  const venuesForCity = useMemo(
    () => venues.filter((venue) => venue.city === city),
    [venues, city]
  );

  useEffect(() => {
    if (venuesForCity.length === 0) {
      return;
    }

    const preferredVenue =
      venuesForCity.find((venue) => venue.venueName === venueName) ?? venuesForCity[0];

    setVenueName(preferredVenue.venueName);
    setCapacity(preferredVenue.capacity);
    setGenre(preferredVenue.genreFocus[0] ?? "electronic");
  }, [venuesForCity, venueName]);

  const featuredResult = results[0];
  const remainingResults = useMemo(() => results.slice(1), [results]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueName,
          city,
          capacity,
          date,
          genre,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Something went wrong.");
        setResults([]);
        setHasSearched(true);
        return;
      }

      const payload = (await response.json()) as { recommendations: RecommendationResult[] };
      setResults(payload.recommendations);
      setHasSearched(true);
    } catch {
      setError("Unable to load recommendations right now.");
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="shell">
      <section className="topBanner">
        <p className="eyebrow">Venue intelligence</p>
        <h1>Pick your venue. Get your top 20 acts.</h1>
        <p className="heroText">Built for fast booking calls, not endless reading.</p>
      </section>

      <section className="workspace">
        <form className="briefPanel" onSubmit={handleSubmit}>
          <div className="briefHeader">
            <div>
              <p className="eyebrow">Venue dashboard</p>
              <h2>Choose your room</h2>
            </div>
            <button className="submitButton" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Get top 20"}
            </button>
          </div>

          <div className="simpleGrid">
            <label>
              City
              <select value={city} onChange={(event) => setCity(event.target.value)}>
                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Venue
              <select
                value={venueName}
                onChange={(event) => {
                  const selectedVenue = venuesForCity.find(
                    (venue) => venue.venueName === event.target.value
                  );
                  setVenueName(event.target.value);
                  if (selectedVenue) {
                    setCapacity(selectedVenue.capacity);
                  }
                }}
              >
                {venuesForCity.map((venue) => (
                  <option key={venue.venueName} value={venue.venueName}>
                    {venue.venueName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Capacity
              <input
                type="number"
                min="50"
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value))}
              />
            </label>

            <label>
              Genre
              <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                {genreOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>

          <div className="microNote">
            Scoring: popularity 30% · followers 20% · genre fit 20% · room fit 15% · momentum 15%
          </div>
        </form>

        <section className="resultsPanel">
          {!hasSearched ? (
            <div className="launchState">
              <div className="launchBadge">Dashboard</div>
              <h2>Choose a venue and we’ll rank the best artists for it.</h2>
              <p>Top 20 curated artists first, with demand score and quick rationale.</p>
            </div>
          ) : null}

          {error ? <p className="errorText">{error}</p> : null}

          {featuredResult ? (
            <div className="resultsStack">
              <div className="sectionTag">Top recommendation</div>
              <ArtistCard result={featuredResult} featured />

              <div className="sectionTag">Top 20 artists</div>
              <div className="resultsList compactList">
                {remainingResults.map((result) => (
                  <ArtistCard key={result.artist.artistName} result={result} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}
