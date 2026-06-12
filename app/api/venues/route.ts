import { NextResponse } from "next/server";
import { getVenueDatabase } from "@/lib/db/fileDatabase";

export async function GET() {
  const venues = await getVenueDatabase();
  return NextResponse.json({ venues });
}
