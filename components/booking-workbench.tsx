"use client";

import { useState } from "react";
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
      setError("Unable to fetch recommendations right now.");
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="shell">
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Demand-led booking intelligence</p>
          <h1>Shortlist artists with the best local sell-through potential.</h1>
          <p className="heroText">
            Built for independent venues that need practical booking decisions, not vanity metrics.
            Enter the room profile, date and budget, then rank artists by local demand, fit and momentum.
          </p>
        </div>
        <div className="heroStats">
          <div>
            <span>Inputs</span>
            <strong>City, date, genre, cap, budget</strong>
          </div>
          <div>
            <span>Outputs</span>
            <strong>Ranked, explained recommendations</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>Mock data, API-ready structure</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="panel formPanel" onSubmit={handleSubmit}>
          <div className="panelHeading">
            <div>
              <p className="eyebrow">Venue brief</p>
              <h2>Search criteria</h2>
            </div>
            <button className="submitButton" type="submit" disabled={isLoading}>
              {isLoading ? "Ranking artists..." : "Generate shortlist"}
            </button>
          </div>

          <div className="formGrid">
            <label>
              Venue city
              <input
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                placeholder="Manchester"
              />
            </label>

            <label>
              Venue capacity
              <input
                type="number"
                min="50"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
              />
            </label>

            <label>
              Available date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>

            <label>
              Budget min
              <input
                type="number"
                min="0"
                step="100"
                value={form.budgetMin}
                onChange={(event) => setForm({ ...form, budgetMin: Number(event.target.value) })}
              />
            </label>

            <label>
              Budget max
              <input
                type="number"
                min="0"
                step="100"
                value={form.budgetMax}
                onChange={(event) => setForm({ ...form, budgetMax: Number(event.target.value) })}
              />
            </label>
          </div>

          <div>
            <span className="fieldLabel">Genre preferences</span>
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

          <div className="weightsNote">
            <span>Scoring weights</span>
            <p>
              Local demand 30% · Genre match 20% · Venue capacity fit 15% · Recent momentum 15% ·
              Nearby performance history 10% · Budget fit 10%
            </p>
          </div>
        </form>

        <div className="panel resultsPanel">
          <div className="panelHeading">
            <div>
              <p className="eyebrow">Ranked artists</p>
              <h2>Recommendation shortlist</h2>
            </div>
          </div>

          {!hasSearched ? (
            <div className="emptyState">
              <p>Use the default brief or update the inputs, then generate a ranked shortlist.</p>
            </div>
          ) : null}

          {error ? <p className="errorText">{error}</p> : null}

          <div className="resultsList">
            {results.map((result) => (
              <ArtistCard key={result.artist.id} result={result} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
