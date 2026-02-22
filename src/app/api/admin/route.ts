import { NextRequest, NextResponse } from "next/server";
import { getPeople, savePeople } from "@/lib/store";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "slava123";

export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get("pw");
  if (pw !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const people = await getPeople();
  return NextResponse.json(people);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!Array.isArray(body.people)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    await savePeople(body.people);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
