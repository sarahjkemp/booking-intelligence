# Demand-Led Booking Intelligence MVP

Demo-ready MVP web app for independent music venues to shortlist artists by likely local ticket demand.

## What it does

- Collects venue booking criteria: city, capacity, available date, genre preferences and budget range
- Calls a simple backend API route
- Scores a mock artist dataset against six weighted signals
- Returns a ranked shortlist with practical explanations for each recommendation

## Stack

- Next.js App Router
- React
- TypeScript
- API route at `app/api/recommendations/route.ts`
- Mock dataset at `data/artists.json`

## Run locally

```bash
cd "/Users/sarahkemp/Documents/New project/booking-intelligence-mvp"
npm install
npm run dev
```

Then open `http://localhost:3000`.

## MVP scoring model

The current ranking logic lives in `lib/scoring.ts`.

Weights:

- Local demand signal: 30%
- Genre match: 20%
- Venue capacity fit: 15%
- Recent momentum: 15%
- Historical nearby performance: 10%
- Budget fit: 10%

The model is intentionally transparent and mock-driven so it is easy to demo, tune and replace with real sources later.

## Mock data included

Each artist record contains:

- Artist name
- Genres
- City base
- Budget range
- Preferred venue size
- Local demand by city
- Momentum score
- Nearby performance history score
- Spotify popularity and follower placeholders
- Instagram engagement placeholder
- Recent nearby event notes
- Recommendation note

## Best places to connect real APIs next

`lib/scoring.ts` and `app/api/recommendations/route.ts` are the main integration points.

Suggested next integrations:

- Spotify API
  - Replace `spotifyPopularity` and `spotifyFollowers` with live artist audience data
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
- The UI is designed to feel practical and venue-operator focused rather than consumer music facing
- The available date is captured now and can later be used for tour clash checks, routing logic and on-sale window timing
