# Booking Intelligence Score MVP

Demo-ready MVP web app for independent music venues to score artist bookings by commercial viability.

## What it does

- Loads a seeded venue database for UK independent music rooms
- Loads a curated mixed-genre artist catalogue for UK-bookable acts
- Collects venue booking criteria: venue, city, capacity, available date and genre
- Calls a simple backend API route
- Returns a ranked top 20 artist list with demand score and recommendation rationale

## Stack

- Next.js App Router
- React
- TypeScript
- File-backed JSON database in `data/db`
- API route at `app/api/recommendations/route.ts`
- API-ready service adapters in `lib/services`

## Run locally

```bash
cd "/Users/sarahkemp/Documents/New project/booking-intelligence-mvp"
npm install
npm run dev
```

Then open `http://localhost:3000`.

If you want live Spotify enrichment locally, create a `.env.local` file from `.env.example` and add:

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

To regenerate the artist database:

```bash
npm run seed:artists
```

This now writes a curated mixed-genre catalogue of 500 commercially relevant artists with nullable Spotify fields.

If you want to test the separate Spotify enrichment pipeline later, use:

```bash
npm run seed:artists:spotify
```

## Deploy on Render

This repo is now set up for Render with [`render.yaml`](/Users/sarahkemp/Documents/New project/booking-intelligence-mvp/render.yaml).

Recommended setup:

1. In Render, choose `New +` then `Blueprint`.
2. Connect the GitHub repo `sarahjkemp/booking-intelligence`.
3. Render will detect `render.yaml` and create the web service.
4. Use the default build and start commands from the blueprint:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
5. After deploy, open the `.onrender.com` URL and test the scoring flow.

Notes:

- This is a Node web service, not a static site, because the MVP uses a Next.js API route.
- No private environment variables are required for the curated catalogue version.
- When real data integrations are added later, secrets like Spotify or social API keys should be added in Render environment settings.

## MVP scoring model

The current recommendation logic lives in `lib/venueRecommendationEngine.ts`.

Weights:

- Spotify popularity: 30%
- Spotify followers: 20%
- Genre fit: 20%
- Venue capacity fit: 15%
- Momentum score: 15%

The model is intentionally transparent and designed so Bandsintown and Resident Advisor signals can be added later without changing the dashboard workflow.

## Database schema

Artist database schema:

- `artistName`
- `spotifyArtistId`
- `spotifyUrl`
- `catalogueStatus` (`curated`, `spotify_enriched`, `fallback`)
- `genre`
- `genres`
- `spotifyFollowers`
- `spotifyPopularity`
- `imageUrl`
- `estimatedFeeRange`
- `localDemandScore`
- `momentumScore`
- `recentNearbyEvents`
- `venueCapacityFit`

Venue database schema:

- `venueName`
- `city`
- `capacity`
- `genreFocus`

## Data source modules

The app includes API-ready source modules for future enrichment:

- `lib/services/spotifyService.ts`
  - API-ready Spotify artist search and artist enrichment
  - Uses mock JSON fallback from `data/mock/spotify-artists.json`
- `lib/services/bandsintownService.ts`
  - API-ready event lookup and location extraction
  - Uses mock JSON fallback from `data/mock/bandsintown-events.json`
- `lib/services/instagramManualService.ts`
  - Manual CSV input from `data/manual/instagram-manual.csv`
- `lib/services/residentAdvisorManualService.ts`
  - Manual CSV input from `data/manual/resident-advisor-manual.csv`

The seeded dashboard currently runs from the curated database layer, while these services are ready for future enrichment and reseeding.

## Optional environment variables

For live enrichment later, these env vars are supported:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `BANDSINTOWN_APP_ID`

If those are not present, the app stays fully functional on local mock/manual data.

The Spotify client-credentials flow in `lib/services/spotifyService.ts` reads all credentials from `process.env`.

## Mock data included

Each artist record contains:

- Real artist name
- Catalogue status flag
- Genre and genre tags
- Estimated fee range
- Venue capacity fit
- Local demand score
- Momentum score
- Nullable Spotify ID / URL / image / popularity / followers fields

## Best places to connect real APIs next

`scripts/seed-spotify-artists.mjs`, `lib/venueRecommendationEngine.ts`, and `app/api/recommendations/route.ts` are the main integration points for the next data phase.

Suggested next integrations:

- Spotify API
  - Enrich curated artists with `spotifyArtistId`, `spotifyUrl`, `imageUrl`, `spotifyPopularity` and `spotifyFollowers`
  - Add listener geography if available through internal enrichment
- Instagram Graph API or creator analytics source
  - Replace the engagement placeholder with recent engagement, growth and location-aware audience clues
- Songkick or Bandsintown
  - Replace nearby event history placeholders with verified upcoming and recent event data
  - Add city-level touring frequency, support slots and venue history
- Resident Advisor
  - Add venue and promoter demand signals for electronic artists and club-led markets
- X or another social listening source
  - Add release chatter, announcement response and short-term momentum signals

## Notes

- This is intentionally an MVP: no auth, payments, database or external API setup yet
- The UI is designed to feel like a commercial booking tool, not a consumer music product or analytics dashboard
- The available date is captured now and can later be used for tour clash checks, routing logic and on-sale window timing
