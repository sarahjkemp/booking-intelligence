import { writeFile } from "node:fs/promises";
import path from "node:path";

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const artistQueries = [
  "pop",
  "indie",
  "indie pop",
  "alternative",
  "rock",
  "hip hop",
  "rap",
  "r&b",
  "soul",
  "electronic",
  "house",
  "techno",
  "jazz",
  "folk",
  "afrobeats",
  "punk",
  "singer songwriter",
  "dance",
  "latin pop",
  "uk artist"
];

const cityPool = ["London", "Manchester", "Bristol", "Leeds", "Brighton", "Glasgow", "Liverpool"];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function buildFallbackRecords(count = 500) {
  const adjectives = [
    "Neon", "Static", "Silver", "Velvet", "Midnight", "Crystal", "Echo", "Signal",
    "Future", "Low", "Night", "Pulse", "Voltage", "Modular", "After", "Shadow",
    "Mirror", "Ghost", "Nova", "Ultra", "Satellite", "Sonic", "Sub", "Prism", "Delta"
  ];
  const nouns = [
    "Circuit", "Harbor", "Method", "Motion", "Arcade", "Unit", "System", "Room",
    "Pattern", "Operator", "Sequence", "Tide", "Machine", "Pulse", "Drift", "Theory",
    "Relay", "Archive", "Phase", "Vector", "Groove", "Echo", "Warehouse", "Signal", "Drive"
  ];
  const subgenres = [
    "pop",
    "indie pop",
    "alternative rock",
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

  const records = [];
  let index = 0;

  for (const adjective of adjectives) {
    for (const noun of nouns) {
      index += 1;
      if (records.length >= count) {
        return records;
      }

      const followers = 12000 + index * 1450;
      const popularity = clamp(28 + (index % 65));
      const localDemandScore = clamp(35 + (index % 50));
      const momentumScore = clamp(38 + ((index * 3) % 55));
      const minCapacity = 120 + (index % 7) * 40;
      const maxCapacity = minCapacity + 220;

      records.push({
        artistName: `${adjective} ${noun}`,
        spotifyArtistId: `mock-artist-${index}`,
        genre: subgenres[index % subgenres.length],
        spotifyFollowers: followers,
        spotifyPopularity: popularity,
        imageUrl: null,
        estimatedFeeRange: {
          min: 800 + (index % 12) * 250,
          max: 1600 + (index % 12) * 350,
          currency: "GBP"
        },
        localDemandScore,
        momentumScore,
        recentNearbyEvents: [
          `${cityPool[index % cityPool.length]} support slot`,
          `${cityPool[(index + 2) % cityPool.length]} headline date`,
          `${cityPool[(index + 4) % cityPool.length]} independent room show`
        ],
        venueCapacityFit: {
          min: minCapacity,
          max: maxCapacity
        },
        futureSignals: {
          bandsintownEventHistoryReady: false,
          residentAdvisorReady: false
        }
      });
    }
  }

  return records;
}

async function getSpotifyToken() {
  if (!spotifyClientId || !spotifyClientSecret) {
    return null;
  }

  const encodedCredentials = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

async function fetchArtistsFromSpotify() {
  const accessToken = await getSpotifyToken();

  if (!accessToken) {
    return buildFallbackRecords(500);
  }

  const artistsById = new Map();

  for (const query of artistQueries) {
    for (let offset = 0; offset < 100 && artistsById.size < 500; offset += 50) {
      const params = new URLSearchParams({
        q: query,
        type: "artist",
        limit: "50",
        offset: String(offset)
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      for (const item of payload.artists?.items ?? []) {
        if (artistsById.size >= 500) {
          break;
        }
        artistsById.set(item.id, item);
      }
    }
  }

  const artistIds = [...artistsById.keys()].slice(0, 750);
  const detailedArtists = [];

  for (let index = 0; index < artistIds.length; index += 20) {
    const ids = artistIds.slice(index, index + 20);
    const batch = await Promise.all(
      ids.map(async (artistId) => {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          return null;
        }

        return response.json();
      })
    );

    detailedArtists.push(...batch.filter(Boolean));
  }

  const filteredArtists = detailedArtists.filter((artist) => {
    const genres = artist.genres ?? [];
    const followers = Number(artist.followers?.total ?? 0);
    const popularity = Number(artist.popularity ?? 0);

    return genres.length > 0 && followers >= 5000 && popularity >= 20;
  });

  const records = filteredArtists.slice(0, 500).map((artist, index) => {
    const popularity = Number(artist.popularity ?? 0);
    const followers = Number(artist.followers?.total ?? 0);
    const localDemandScore = clamp(Math.round(popularity * 0.72 + Math.log10(Math.max(followers, 1)) * 8));
    const momentumScore = clamp(Math.round(popularity * 0.7 + (index % 18)));
    const minCapacity = 120 + (index % 8) * 45;
    const maxCapacity = minCapacity + 260;

    return {
      artistName: artist.name,
      spotifyArtistId: artist.id,
      genre: artist.genres?.[0] ?? "pop",
      spotifyFollowers: followers,
      spotifyPopularity: popularity,
      imageUrl: artist.images?.[0]?.url ?? null,
      estimatedFeeRange: {
        min: 1000 + Math.round(popularity * 20),
        max: 1800 + Math.round(popularity * 38),
        currency: "GBP"
      },
      localDemandScore,
      momentumScore,
      recentNearbyEvents: [],
      venueCapacityFit: {
        min: minCapacity,
        max: maxCapacity
      },
      futureSignals: {
        bandsintownEventHistoryReady: false,
        residentAdvisorReady: false
      }
    };
  });

  if (records.length < 500) {
    return [...records, ...buildFallbackRecords(500 - records.length)];
  }

  return records;
}

async function main() {
  const records = await fetchArtistsFromSpotify();
  const filePath = path.join(process.cwd(), "data", "db", "artists.json");
  await writeFile(filePath, JSON.stringify(records, null, 2));
  console.log(`Wrote ${records.length} artist records to ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
