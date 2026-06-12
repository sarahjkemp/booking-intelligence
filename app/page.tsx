import { BookingWorkbench } from "@/components/booking-workbench";
import { getArtistDatabase, getVenueDatabase } from "@/lib/db/fileDatabase";
import { buildDemoScenarios } from "@/lib/demoScenarios";

export default async function Home() {
  const [artists, venues] = await Promise.all([getArtistDatabase(), getVenueDatabase()]);
  const demoScenarios = buildDemoScenarios({ artists, venues });

  return <BookingWorkbench demoScenarios={demoScenarios} />;
}
