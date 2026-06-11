"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { genreOptions, type ScoredArtist, type SearchInput } from "@/lib/types";

const initialForm: SearchInput = {
  city: "Manchester",
  capacity: 350,
  date: "2026-09-18",
  genres: ["indie", "electronic"],
  budgetMin: 1500,
  budgetMax: 4000,
};

export function BookingWorkbench() {
  const [form, setForm] = useState<SearchInput>(initialForm);
  const [results, setResults] = useState<ScoredArtist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const featuredResult = results[0];
  const remainingResults = useMemo(() => results.slice(1), [results]);

  function toggleGenre(genre: (typeof genreOptions)[number]) {
    setForm((current) => {
      const exists = current.genres.includes(genre);
      return {
        ...current,
        genres: exists
          ? current.genres.filter((item) => item !== genre)
          : [...current.genres, genre],
      };
    });
  }

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
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Something went wrong.");
        setResults([]);
        setHasSearched(true);
        return;
      }

      const payload = (await response.json()) as { recommendations: ScoredArtist[] };
      setResults(payload.recommendations);
      setHasSearched(true);
    } catch {
      setError("Unable to score acts right now.");
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="shell">
      <section className="topBanner">
        <p className="eyebrow">Booking score</p>
        <h1>Find the act most likely to shift tickets.</h1>
        <p className="heroText">
          Put in the basics. Get a blunt commercial answer.
        </p>
      </section>

      <section className="workspace">
        <form className="briefPanel" onSubmit={handleSubmit}>
          <div className="briefHeader">
            <div>
              <p className="eyebrow">Quick brief</p>
              <h2>What are you trying to fill?</h2>
            </div>
            <button className="submitButton" type="submit" disabled={isLoading}>
              {isLoading ? "Scoring..." : "Get score"}
            </button>
          </div>

          <div className="simpleGrid">
            <label>
              City
              <input
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                placeholder="Manchester"
              />
            </label>

            <label>
              Capacity
              <input
                type="number"
                min="50"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>

            <label>
              Max budget
              <input
                type="number"
                min="0"
                step="100"
                value={form.budgetMax}
                onChange={(event) => setForm({ ...form, budgetMax: Number(event.target.value) })}
              />
            </label>
          </div>

          <div className="genreBlock">
            <span className="fieldLabel">Pick your genres</span>
            <div className="chipRow">
              {genreOptions.map((genre) => {
                const active = form.genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    className={active ? "genreChip active" : "genreChip"}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="microNote">
            Score uses local demand, room fit, recent momentum and fee fit.
          </div>
        </form>

        <section className="resultsPanel">
          {!hasSearched ? (
            <div className="launchState">
              <div className="launchBadge">Top call</div>
              <h2>Press “Get score” and we’ll tell you who looks safest.</h2>
              <p>Big answer first. No dashboard archaeology.</p>
            </div>
          ) : null}

          {error ? <p className="errorText">{error}</p> : null}

          {featuredResult ? (
            <div className="resultsStack">
              <div className="sectionTag">Best booking call</div>
              <ArtistCard result={featuredResult} featured />

              <div className="sectionTag">Other options</div>
              <div className="resultsList compactList">
                {remainingResults.map((result) => (
                  <ArtistCard key={result.artist.id} result={result} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}
