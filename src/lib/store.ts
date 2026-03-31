/**
 * Data store for people data.
 * Uses Vercel Blob in production (requires BLOB_READ_WRITE_TOKEN env var).
 * Falls back to hardcoded data.ts when Blob is not configured.
 *
 * To enable persistence on Vercel:
 *   1. Go to your Vercel project → Storage → Create Blob store → link it
 *   2. Run `vercel env pull .env.local` to get the token locally
 */

import { Person } from "./types";
import { people as defaultPeople } from "./data";

const BLOB_FILENAME = "vibefolio-people.json";

async function getBlobModule() {
  // Dynamic import so the build doesn't fail if @vercel/blob isn't configured
  return await import("@vercel/blob");
}

export async function getPeople(): Promise<Person[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return defaultPeople;
  }
  try {
    const { list } = await getBlobModule();
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return data as Person[];
      }
    }
  } catch {
    // fall through
  }
  return defaultPeople;
}

export async function savePeople(people: Person[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Vercel Blob storage is required to save data."
    );
  }
  const { put, list, del } = await getBlobModule();
  // Remove existing blobs at this path
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch {
    // ignore deletion errors
  }
  await put(BLOB_FILENAME, JSON.stringify(people, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
