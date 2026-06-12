import { NextResponse } from "next/server";
import { searchSpotifyArtists } from "@/lib/services/spotifyService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ error: "Query parameter 'name' is required." }, { status: 400 });
  }

  const artists = await searchSpotifyArtists(name, 5);

  return NextResponse.json({
    artists: artists.map((artist) => ({
      artistName: artist.name,
      spotifyArtistId: artist.id,
      followers: artist.followers,
      popularity: artist.popularity,
      genres: artist.genres,
      spotifyUrl: artist.externalUrl ?? null,
      imageUrl: artist.imageUrl ?? null,
    })),
  });
}
