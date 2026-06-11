import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/scoring";
import type { SearchInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SearchInput>;

  if (!body.city || !body.capacity || !body.date || !body.budgetMax) {
    return NextResponse.json(
      { error: "City, capacity, date and budget are required." },
      { status: 400 }
    );
  }

  const input: SearchInput = {
    city: body.city,
    capacity: Number(body.capacity),
    date: body.date,
    genres: Array.isArray(body.genres) ? body.genres : [],
    budgetMin: Number(body.budgetMin ?? 0),
    budgetMax: Number(body.budgetMax),
  };

  const recommendations = getRecommendations(input);

  return NextResponse.json({
    query: input,
    recommendations,
    scoringModel: {
      weights: {
        localDemand: 0.3,
        genreMatch: 0.2,
        capacityFit: 0.15,
        momentum: 0.15,
        eventHistory: 0.1,
        budgetFit: 0.1,
      },
      notes: [
        "Mock signals are used for Spotify, Instagram, nearby event history and demand.",
        "This route is the intended insertion point for future API orchestration and normalization.",
      ],
    },
  });
}
