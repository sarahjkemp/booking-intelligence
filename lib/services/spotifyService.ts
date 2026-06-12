import spotifyArtistMocks from "@/data/mock/spotify-artists.json";
import spotifyTopTracksMocks from "@/data/mock/spotify-top-tracks.json";

type SpotifyTokenCache = {
  accessToken: string;
  expiresAt: number;
};

export type SpotifyArtistSearchResult = {
  id: string;
  name: string;
  genres: string[];
  followers: number;
  popularity: number;
  externalUrl?: string;
  imageUrl?: string;
};

export type SpotifyTopTrack = {
  id: string;
  name: string;
  albumName: string;
  previewUrl: string | null;
  spotifyUrl?: string;
  popularity: number;
};

type SpotifyArtistMock = SpotifyArtistSearchResult & {
  artistName: string;
};

type SpotifyTopTracksMock = {
  artistId: string;
  artistName: string;
  tracks: SpotifyTopTrack[];
};

let tokenCache: SpotifyTokenCache | null = null;

function getMockArtists() {
  return spotifyArtistMocks as SpotifyArtistMock[];
}

function getMockTopTracks() {
  return spotifyTopTracksMocks as SpotifyTopTracksMock[];
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  // Official Spotify docs: client-credentials flow uses POST https://accounts.spotify.com/api/token
  // with grant_type=client_credentials and Basic auth from client_id:client_secret.
  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    tokenCache = {
      accessToken: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000 - 60_000,
    };

    return tokenCache.accessToken;
  } catch {
    return null;
  }
}

export async function searchSpotifyArtists(artistName: string, limit = 5) {
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return getMockArtists()
      .filter((artist) => artist.artistName.toLowerCase().includes(artistName.toLowerCase()))
      .slice(0, limit);
  }

  const params = new URLSearchParams({
    q: artistName,
    type: "artist",
    limit: String(limit),
  });

  // Official Spotify docs: GET https://api.spotify.com/v1/search?q=...&type=artist
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return getMockArtists()
        .filter((artist) => artist.artistName.toLowerCase().includes(artistName.toLowerCase()))
        .slice(0, limit);
    }

    const payload = (await response.json()) as {
      artists?: {
        items: Array<{
          id: string;
          name: string;
          genres?: string[];
          popularity?: number;
          external_urls?: { spotify?: string };
          followers?: { total?: number };
          images?: Array<{ url?: string }>;
        }>;
      };
    };

    return (payload.artists?.items ?? []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      genres: artist.genres ?? [],
      followers: artist.followers?.total ?? 0,
      popularity: artist.popularity ?? 0,
      externalUrl: artist.external_urls?.spotify,
      imageUrl: artist.images?.[0]?.url,
    }));
  } catch {
    return getMockArtists()
      .filter((artist) => artist.artistName.toLowerCase().includes(artistName.toLowerCase()))
      .slice(0, limit);
  }
}

export async function getSpotifyArtistTopTracks(artistId: string, market = "GB") {
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return getMockTopTracks().find((artist) => artist.artistId === artistId)?.tracks ?? [];
  }

  try {
    // Official Spotify docs: GET https://api.spotify.com/v1/artists/{id}/top-tracks?market={market}
    const params = new URLSearchParams({ market });
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return getMockTopTracks().find((artist) => artist.artistId === artistId)?.tracks ?? [];
    }

    const payload = (await response.json()) as {
      tracks?: Array<{
        id: string;
        name: string;
        preview_url?: string | null;
        popularity?: number;
        external_urls?: { spotify?: string };
        album?: { name?: string };
      }>;
    };

    return (payload.tracks ?? []).map((track) => ({
      id: track.id,
      name: track.name,
      albumName: track.album?.name ?? "Unknown album",
      previewUrl: track.preview_url ?? null,
      spotifyUrl: track.external_urls?.spotify,
      popularity: track.popularity ?? 0,
    }));
  } catch {
    return getMockTopTracks().find((artist) => artist.artistId === artistId)?.tracks ?? [];
  }
}

export async function enrichSpotifyArtistProfile(artistName: string) {
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    const mock = getMockArtists().find(
      (artist) => artist.artistName.toLowerCase() === artistName.toLowerCase()
    );

    return {
      spotifyFollowers: mock?.followers ?? 0,
      spotifyPopularity: mock?.popularity ?? 0,
      spotifyGenres: mock?.genres ?? [],
    };
  }

  const searchResults = await searchSpotifyArtists(artistName, 1);
  const selectedArtist = searchResults[0];

  if (!selectedArtist?.id) {
    return {
      spotifyFollowers: 0,
      spotifyPopularity: 0,
      spotifyGenres: [],
    };
  }

  // Official Spotify docs: GET https://api.spotify.com/v1/artists/{id}
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${selectedArtist.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        spotifyFollowers: selectedArtist.followers,
        spotifyPopularity: selectedArtist.popularity,
        spotifyGenres: selectedArtist.genres,
      };
    }

    const payload = (await response.json()) as {
      followers?: { total?: number };
      popularity?: number;
      genres?: string[];
    };

    return {
      spotifyFollowers: payload.followers?.total ?? selectedArtist.followers,
      spotifyPopularity: payload.popularity ?? selectedArtist.popularity,
      spotifyGenres: payload.genres ?? selectedArtist.genres,
    };
  } catch {
    return {
      spotifyFollowers: selectedArtist.followers,
      spotifyPopularity: selectedArtist.popularity,
      spotifyGenres: selectedArtist.genres,
    };
  }
}
