import { NextResponse } from "next/server";
import { getPeople } from "@/lib/store";
import { people as seedPeople } from "@/lib/data";
import { Person } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const people = await getPeople();
    // Ensure every person has a username — if the blob entry is missing one,
    // fall back to the seed value (matched by id). This makes URL routing work
    // immediately without requiring a manual admin re-save.
    const enriched: Person[] = people.map((p) => {
      const seed = seedPeople.find((s) => s.id === p.id);
      return {
        ...p,
        username: p.username ?? seed?.username,
        introTagline: p.introTagline ?? seed?.introTagline,
      };
    });
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}
