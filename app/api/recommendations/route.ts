import { NextResponse } from "next/server";
import { getArtistDatabase, getVenueDatabase } from "@/lib/db/fileDatabase";
import { recommendArtistsForVenue } from "@/lib/venueRecommendationEngine";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    venueName: string;
    city: string;
    capacity: number;
    date: string;
    genre: string;
  }>;

  if (!body.city || !body.capacity || !body.date || !body.genre) {
    return NextResponse.json(
      { error: "City, capacity, date and genre are required." },
      { status: 400 }
    );
  }

  const [artists, venues] = await Promise.all([getArtistDatabase(), getVenueDatabase()]);

  const recommendations = recommendArtistsForVenue({
    artists,
    venues,
    input: {
      venueName: body.venueName,
      city: body.city,
      capacity: Number(body.capacity),
      date: body.date,
      genre: body.genre,
    },
  });

  return NextResponse.json({
    query: body,
    recommendations,
    scoringModel: {
      weights: {
        spotifyPopularity: 0.3,
        spotifyFollowers: 0.2,
        genreFit: 0.2,
        venueCapacityFit: 0.15,
        momentumScore: 0.15,
      },
      notes: [
        "Bandsintown event history and Resident Advisor signals are reserved for future enrichment.",
        "The MVP currently scores from the seeded artist database plus venue fit logic.",
      ],
    },
  });
}
