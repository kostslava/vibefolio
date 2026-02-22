import { NextResponse } from "next/server";
import { getPeople } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const people = await getPeople();
    return NextResponse.json(people);
  } catch {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}
