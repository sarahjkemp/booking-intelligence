import { NextResponse } from "next/server";
import { getSpotifyArtistTopTracks } from "@/lib/services/spotifyService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const market = searchParams.get("market")?.trim().toUpperCase() || "GB";

  if (!id) {
    return NextResponse.json({ error: "Artist ID is required." }, { status: 400 });
  }

  const tracks = await getSpotifyArtistTopTracks(id, market);

  return NextResponse.json({
    artistId: id,
    market,
    tracks,
  });
}
