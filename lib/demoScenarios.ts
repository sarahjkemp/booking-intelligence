import type { ArtistDatabaseRecord, VenueDatabaseRecord } from "@/lib/db/schema";
import {
  recommendArtistsForVenue,
  type VenueRecommendation,
} from "@/lib/venueRecommendationEngine";

export type DemoScenario = {
  id: string;
  title: string;
  brief: string;
  city: string;
  venue: string;
  capacity: number;
  date: string;
  genre: string;
  topRecommendations: VenueRecommendation[];
};

const demoScenarioInputs = [
  {
    id: "brighton-house-300",
    title: "Brighton 300-cap House venue",
    brief: "A small coastal dance room that needs credible club selectors, not festival headliners.",
    city: "Brighton",
    venue: "Patterns",
    capacity: 300,
    date: "2026-10-10",
    genre: "house",
  },
  {
    id: "manchester-indie-500",
    title: "Manchester 500-cap Indie venue",
    brief: "A city-centre indie room looking for acts that can genuinely move tickets at mid-level.",
    city: "Manchester",
    venue: "Hidden",
    capacity: 500,
    date: "2026-10-17",
    genre: "indie",
  },
  {
    id: "london-hiphop-1000",
    title: "London 1000-cap Hip-Hop venue",
    brief: "A larger London play aiming for strong commercial rap names that feel plausible at this scale.",
    city: "London",
    venue: "Village Underground",
    capacity: 1000,
    date: "2026-11-06",
    genre: "hip hop",
  },
  {
    id: "bristol-jazz-400",
    title: "Bristol 400-cap Jazz venue",
    brief: "A musically literate room that needs modern jazz acts with enough draw to fill the space.",
    city: "Bristol",
    venue: "Strange Brew",
    capacity: 400,
    date: "2026-10-24",
    genre: "jazz",
  },
  {
    id: "leeds-electronic-250",
    title: "Leeds 250-cap Electronic club",
    brief: "A tight late-night room looking for artists that suit underground electronic programming.",
    city: "Leeds",
    venue: "Wire",
    capacity: 250,
    date: "2026-09-26",
    genre: "electronic",
  },
  {
    id: "london-rnb-700",
    title: "London 700-cap R&B venue",
    brief: "A London bill needing soulful crossover names that can hold a bigger room.",
    city: "London",
    venue: "Village Underground",
    capacity: 700,
    date: "2026-11-14",
    genre: "r&b",
  },
  {
    id: "brighton-alternative-600",
    title: "Brighton 600-cap Alternative venue",
    brief: "A stronger coastal room with room for alternative crossover acts, not arena names.",
    city: "Brighton",
    venue: "Concorde 2",
    capacity: 600,
    date: "2026-10-31",
    genre: "alternative",
  },
  {
    id: "manchester-punk-350",
    title: "Manchester 350-cap Punk room",
    brief: "A sharper-edged Manchester space wanting acts that feel rowdy, current and venue-appropriate.",
    city: "Manchester",
    venue: "The White Hotel",
    capacity: 350,
    date: "2026-11-20",
    genre: "punk",
  },
  {
    id: "bristol-folk-300",
    title: "Bristol 500-cap Folk venue",
    brief: "A seated-leaning Bristol room where audience trust matters more than raw streaming size.",
    city: "Bristol",
    venue: "Lantern Hall",
    capacity: 500,
    date: "2026-10-03",
    genre: "folk",
  },
  {
    id: "leeds-pop-300",
    title: "Leeds 300-cap Pop venue",
    brief: "A nimble Leeds room looking for smart commercial pop that still feels achievable.",
    city: "Leeds",
    venue: "Belgrave Music Hall",
    capacity: 300,
    date: "2026-12-04",
    genre: "pop",
  },
] as const;

export function buildDemoScenarios(args: {
  artists: ArtistDatabaseRecord[];
  venues: VenueDatabaseRecord[];
}) {
  const { artists, venues } = args;

  return demoScenarioInputs.map((scenario) => ({
    ...scenario,
    topRecommendations: recommendArtistsForVenue({
      artists,
      venues,
      input: {
        venueName: scenario.venue,
        city: scenario.city,
        capacity: scenario.capacity,
        date: scenario.date,
        genre: scenario.genre,
      },
    }).slice(0, 4),
  }));
}
