import { NextResponse } from "next/server";
import { people } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(people);
}
