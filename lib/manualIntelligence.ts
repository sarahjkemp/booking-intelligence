type CityName = "Brighton" | "London" | "Manchester" | "Bristol" | "Leeds";

type ManualArtistOverride = {
  citySignals?: Partial<Record<CityName, { score: number; note: string }>>;
  overexposureRisk?: {
    score: number;
    label: "low" | "medium" | "high";
    notes: string[];
  };
  comparableVenues?: Array<{
    city: CityName;
    venue: string;
    capacity: number;
    note: string;
  }>;
  bookerNotes?: string[];
  confidenceTier?: "high" | "medium" | "low";
  recentNearbyEvents?: string[];
};

export const cityOrder = [
  "Brighton",
  "London",
  "Manchester",
  "Bristol",
  "Leeds",
] as const;

const genreCityProfiles: Record<
  string,
  Record<CityName, { score: number; note: string }>
> = {
  pop: {
    Brighton: { score: 48, note: "Works when pitched as crossover pop, but price sensitivity matters." },
    London: { score: 72, note: "Strong mainstream demand in larger city-market rooms." },
    Manchester: { score: 58, note: "Commercial pop can work, but only at the right ticket price." },
    Bristol: { score: 46, note: "Selective market; crossover names do better than pure chart pop." },
    Leeds: { score: 52, note: "Works when the act feels current and affordable for students." },
  },
  indie: {
    Brighton: { score: 58, note: "Reliable indie audience with appetite for buzzy touring acts." },
    London: { score: 64, note: "Strong depth, but the market is crowded." },
    Manchester: { score: 74, note: "Excellent indie demand and strong local tastemaker culture." },
    Bristol: { score: 62, note: "Solid alternative crowd with good conversion for credible acts." },
    Leeds: { score: 71, note: "Very strong room-level demand for guitar and leftfield indie." },
  },
  rock: {
    Brighton: { score: 50, note: "Selective but dependable for the right heavy or alt-rock bills." },
    London: { score: 68, note: "Broad rock market with room for strong mid-tier names." },
    Manchester: { score: 66, note: "Good crowd for modern heavy and alt-rock acts." },
    Bristol: { score: 56, note: "Performs best when paired with strong live reputation." },
    Leeds: { score: 63, note: "Rock and punk skew can convert well in this market." },
  },
  electronic: {
    Brighton: { score: 72, note: "Strong coastal club market for tasteful selectors and live electronic acts." },
    London: { score: 80, note: "Deepest market, but also the most competitive." },
    Manchester: { score: 64, note: "Works well in warehouse and leftfield club contexts." },
    Bristol: { score: 78, note: "One of the best UK cities for underground electronic demand." },
    Leeds: { score: 68, note: "Healthy club demand, especially for credible underground names." },
  },
  "hip hop": {
    Brighton: { score: 42, note: "Selective and venue-dependent for rap-led bills." },
    London: { score: 84, note: "Strongest UK market for rap, grime and crossover hip-hop." },
    Manchester: { score: 63, note: "Can convert well with credible names and good local support." },
    Bristol: { score: 49, note: "Works for the right name, but less deep than London or Manchester." },
    Leeds: { score: 52, note: "Student-heavy market with upside for contemporary rap." },
  },
  "rnb soul": {
    Brighton: { score: 45, note: "Better for crossover soulful acts than pure R&B bookings." },
    London: { score: 79, note: "Best market for modern soul and R&B crossovers." },
    Manchester: { score: 58, note: "Selective but strong when the act has clear profile." },
    Bristol: { score: 52, note: "Small but engaged audience for soulful contemporary acts." },
    Leeds: { score: 48, note: "Can work in intimate rooms with a clear fanbase." },
  },
  jazz: {
    Brighton: { score: 47, note: "Works best for modern crossover jazz rather than pure traditional bills." },
    London: { score: 73, note: "Deep audience for contemporary UK jazz and adjacent scenes." },
    Manchester: { score: 56, note: "Steady demand for the stronger modern-jazz names." },
    Bristol: { score: 61, note: "Good market for progressive and crossover jazz acts." },
    Leeds: { score: 55, note: "Credible audience for scene-led contemporary jazz." },
  },
  folk: {
    Brighton: { score: 54, note: "Strong seated and attentive audience for singer-songwriter shows." },
    London: { score: 67, note: "Solid audience depth, especially for critically respected names." },
    Manchester: { score: 50, note: "More selective than indie, but can convert in the right room." },
    Bristol: { score: 60, note: "Good fit for intimate, word-of-mouth folk bookings." },
    Leeds: { score: 49, note: "Works best in careful seated-leaning settings." },
  },
};

const artistOverrides: Record<string, ManualArtistOverride> = {
  Bklava: {
    citySignals: {
      Brighton: { score: 76, note: "Feels plausible in a tasteful coastal club room." },
      London: { score: 72, note: "Strong club relevance without being oversize." },
      Bristol: { score: 70, note: "Good fit for leftfield house and bass-oriented nights." },
    },
    comparableVenues: [
      { city: "Brighton", venue: "Patterns", capacity: 300, note: "Plausible late-night house booking." },
      { city: "Leeds", venue: "Wire", capacity: 250, note: "Fits underground club context." },
    ],
    overexposureRisk: { score: 24, label: "low", notes: ["Still feels fresh rather than oversaturated."] },
    bookerNotes: ["Good small-room house pick.", "More believable than marquee dance names at 250-350 cap."],
    confidenceTier: "high",
  },
  Anz: {
    citySignals: {
      Manchester: { score: 82, note: "Excellent local scene relevance." },
      Brighton: { score: 68, note: "Credible crossover into a Brighton club brief." },
      Leeds: { score: 70, note: "Very plausible in tastemaker club programming." },
    },
    comparableVenues: [
      { city: "Manchester", venue: "The White Hotel", capacity: 350, note: "Strong local scene fit." },
      { city: "Leeds", venue: "Wire", capacity: 250, note: "Plausible underground club match." },
    ],
    overexposureRisk: { score: 20, label: "low", notes: ["Still feels like a positive taste signal."] },
    bookerNotes: ["Strong dance-floor credibility.", "Good for rooms that want tastemaker energy over mass draw."],
    confidenceTier: "high",
  },
  "DJ Boring": {
    citySignals: {
      Brighton: { score: 74, note: "Good fit for a 300-cap house/electronic brief." },
      Bristol: { score: 73, note: "Plausible in leftfield electronic rooms." },
      Leeds: { score: 67, note: "Club-credible without feeling too big." },
    },
    bookerNotes: ["Believable club-level draw.", "Safer than top-line dance crossover names in smaller rooms."],
    confidenceTier: "high",
  },
  Bambounou: {
    citySignals: {
      Brighton: { score: 75, note: "Good tastemaker booking for a Brighton house room." },
      Bristol: { score: 76, note: "Strong fit in more underground electronic spaces." },
      London: { score: 71, note: "Credible but market is crowded." },
    },
    bookerNotes: ["Underground credibility is the value here, not mass-market recognition."],
    confidenceTier: "high",
  },
  Editors: {
    citySignals: {
      Manchester: { score: 78, note: "Very plausible big-room indie booking." },
      Leeds: { score: 72, note: "Strong northern indie room fit." },
    },
    comparableVenues: [
      { city: "Manchester", venue: "Hidden", capacity: 500, note: "Venue size is credible for a mid-tier indie brief." },
    ],
    bookerNotes: ["Feels sensible for a 500-cap indie recommendation."],
    confidenceTier: "high",
  },
  Kasabian: {
    citySignals: {
      Manchester: { score: 76, note: "Commercially strong, though less buzzy than newer indie names." },
    },
    bookerNotes: ["Commercially legible suggestion for larger indie rooms."],
    confidenceTier: "medium",
  },
  "The Libertines": {
    citySignals: {
      Manchester: { score: 74, note: "Recognisable indie booking with proven room appeal." },
    },
    confidenceTier: "medium",
  },
  "The Cribs": {
    citySignals: {
      Manchester: { score: 78, note: "Strong regional credibility and believable room fit." },
      Leeds: { score: 82, note: "Particularly strong fit in Yorkshire-facing indie briefs." },
    },
    confidenceTier: "high",
  },
  "P Money": {
    citySignals: {
      London: { score: 82, note: "Very plausible London rap/grime recommendation." },
      Manchester: { score: 62, note: "Good secondary city fit." },
    },
    confidenceTier: "high",
  },
  "Ocean Wisdom": {
    citySignals: {
      London: { score: 80, note: "Strong UK rap recognition without feeling oversized." },
      Bristol: { score: 58, note: "Works as a crossover credible rap pick." },
    },
    confidenceTier: "high",
  },
  "Wretch 32": {
    citySignals: {
      London: { score: 79, note: "Established London relevance makes this a believable recommendation." },
    },
    confidenceTier: "high",
  },
  "Kojey Radical": {
    citySignals: {
      London: { score: 81, note: "Good fit for a more quality-led hip-hop room." },
    },
    confidenceTier: "high",
  },
  "GoGo Penguin": {
    citySignals: {
      Bristol: { score: 76, note: "Strong modern-jazz fit for a 400-cap arts-driven room." },
      London: { score: 72, note: "Proven demand for crossover jazz audiences." },
    },
    confidenceTier: "high",
  },
  "corto.alto": {
    citySignals: {
      Bristol: { score: 73, note: "Very plausible in contemporary jazz-forward programming." },
      Leeds: { score: 66, note: "Scene-relevant and room-appropriate." },
    },
    confidenceTier: "high",
  },
  BADBADNOTGOOD: {
    citySignals: {
      Bristol: { score: 74, note: "Good crossover name for a more adventurous jazz room." },
      London: { score: 76, note: "Strong profile for modern jazz-adjacent audiences." },
    },
    confidenceTier: "medium",
  },
  "Brandee Younger": {
    citySignals: {
      Bristol: { score: 70, note: "Credible contemporary jazz booking." },
    },
    confidenceTier: "medium",
  },
  "Mura Masa": {
    citySignals: {
      Leeds: { score: 74, note: "Believable crossover electronic recommendation for a 250-cap room." },
      Brighton: { score: 66, note: "Works when framed as an electronic-pop crossover draw." },
    },
    confidenceTier: "medium",
  },
  Tourist: {
    citySignals: {
      Leeds: { score: 71, note: "Good fit for an intimate electronic club brief." },
      Brighton: { score: 68, note: "Plausible for leftfield electronic rooms." },
    },
    confidenceTier: "high",
  },
  "Seb Wildblood": {
    citySignals: {
      Leeds: { score: 73, note: "Excellent fit for a smaller electronic room." },
      Bristol: { score: 71, note: "Good leftfield electronic draw for tastemaker spaces." },
    },
    confidenceTier: "high",
  },
  NERO: {
    citySignals: {
      Leeds: { score: 70, note: "Commercially legible electronic name that still fits a club brief." },
    },
    confidenceTier: "medium",
  },
  "Tom Misch": {
    citySignals: {
      London: { score: 84, note: "Excellent London fit for soulful crossover programming." },
      Bristol: { score: 66, note: "Strong appeal in musically literate cities." },
    },
    confidenceTier: "high",
  },
  "Jordan Rakei": {
    citySignals: {
      London: { score: 82, note: "Believable soulful modern-jazz/R&B crossover recommendation." },
      Bristol: { score: 68, note: "Strong fit for quality-led programming." },
    },
    confidenceTier: "high",
  },
  Elmiene: {
    citySignals: {
      London: { score: 79, note: "Current and plausible for a modern R&B brief." },
      Manchester: { score: 59, note: "Secondary upside in a tastemaker room." },
    },
    confidenceTier: "high",
  },
  "Sasha Keable": {
    citySignals: {
      London: { score: 78, note: "Credible London R&B room fit." },
    },
    confidenceTier: "high",
  },
  "Japanese Breakfast": {
    citySignals: {
      Brighton: { score: 71, note: "Feels believable for a 600-cap alternative room." },
      Bristol: { score: 65, note: "Strong crossover appeal in leftfield indie markets." },
    },
    confidenceTier: "high",
  },
  "Porridge Radio": {
    citySignals: {
      Brighton: { score: 72, note: "Excellent cultural fit for a coastal alternative room." },
      Bristol: { score: 66, note: "Strong leftfield indie credibility." },
    },
    confidenceTier: "high",
  },
  "Nova Twins": {
    citySignals: {
      Brighton: { score: 67, note: "Strong alt crossover fit." },
      London: { score: 70, note: "Good visibility in bigger alternative markets." },
    },
    confidenceTier: "medium",
  },
  "The Mysterines": {
    citySignals: {
      Brighton: { score: 66, note: "Believable alternative bill fit." },
      Manchester: { score: 64, note: "Decent regional indie-rock credibility." },
    },
    confidenceTier: "medium",
  },
  "The Bronx": {
    citySignals: {
      Manchester: { score: 73, note: "Punk-heavy room fit feels believable." },
      Leeds: { score: 61, note: "Good secondary fit for heavier regional rooms." },
    },
    confidenceTier: "high",
  },
  Crossfaith: {
    citySignals: {
      Manchester: { score: 69, note: "Works in heavy club/alt contexts." },
    },
    confidenceTier: "medium",
  },
  "Kills Birds": {
    citySignals: {
      Manchester: { score: 66, note: "Good for sharper-edged alternative punk billing." },
    },
    confidenceTier: "medium",
  },
  Poppy: {
    citySignals: {
      Manchester: { score: 64, note: "Crossover heavy-pop angle can work in an alt-leaning room." },
    },
    confidenceTier: "medium",
  },
  "Laura Marling": {
    citySignals: {
      Bristol: { score: 78, note: "Very believable draw for a 500-cap folk room." },
      Brighton: { score: 70, note: "Strong attentive audience fit." },
    },
    confidenceTier: "high",
  },
  "Phoebe Bridgers": {
    citySignals: {
      Bristol: { score: 76, note: "Strong crossover folk-room appeal." },
      London: { score: 80, note: "Large demand, but still credible in quality-led settings." },
    },
    confidenceTier: "medium",
  },
  "Julien Baker": {
    citySignals: {
      Bristol: { score: 75, note: "Strong fit in attentive 400-600 cap rooms." },
    },
    confidenceTier: "high",
  },
  "Lucy Dacus": {
    citySignals: {
      Bristol: { score: 74, note: "Believable draw for smart folk/indie crossover bills." },
    },
    confidenceTier: "high",
  },
  "Ella Henderson": {
    citySignals: {
      Leeds: { score: 68, note: "Commercial but not absurd for a 300-cap pop brief." },
    },
    confidenceTier: "medium",
  },
  Georgia: {
    citySignals: {
      Leeds: { score: 69, note: "Good pop/electronic crossover fit in a smaller room." },
      Brighton: { score: 62, note: "Strong aesthetic fit for a tastemaker crowd." },
    },
    confidenceTier: "high",
  },
  "MØ": {
    citySignals: {
      Leeds: { score: 65, note: "Plausible crossover pop suggestion if priced right." },
    },
    confidenceTier: "medium",
  },
  "Rebecca Black": {
    citySignals: {
      Leeds: { score: 64, note: "Modern niche-pop fit for a smaller room." },
      London: { score: 61, note: "Cultural relevance stronger than broad commercial demand." },
    },
    confidenceTier: "medium",
  },
};

export function getGenreCityProfile(genre: string) {
  return genreCityProfiles[genre] ?? genreCityProfiles.indie;
}

export function getArtistOverride(artistName: string) {
  return artistOverrides[artistName];
}
