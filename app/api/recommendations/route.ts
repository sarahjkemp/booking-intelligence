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
      points: {
        genreFit: 25,
        venueCapacityFit: 25,
        commercialMomentum: 20,
        localRelevance: 20,
        dataConfidence: 10,
      },
      notes: [
        "Scores use the curated catalogue first and reserve fallback records for low-data cases.",
        "When Spotify or city-level signals are missing, the MVP shows limited data and uses placeholder momentum/local demand fields.",
        "Bandsintown and Resident Advisor are reserved for future enrichment.",
      ],
    },
  });
}
