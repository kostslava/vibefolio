/**
 * Data store for people data.
 * Uses Vercel Blob exclusively (requires BLOB_READ_WRITE_TOKEN env var).
 * No fallback to hardcoded data — blob is the single source of truth.
 *
 * To enable persistence on Vercel:
 *   1. Go to your Vercel project → Storage → Create Blob store → link it
 *   2. Run `vercel env pull .env.local` to get the token locally
 */

import { Person } from "./types";

const BLOB_FILENAME = "vibefolio-people.json";

async function getBlobModule() {
  return await import("@vercel/blob");
}

export async function getPeople(): Promise<Person[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return [];
  }
  try {
    const { list } = await getBlobModule();
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length > 0) {
      // Include auth header so any legacy private blobs still work;
      // public blobs (all new saves) simply ignore it.
      const res = await fetch(blobs[0].url, {
        cache: "no-store",
        headers: process.env.BLOB_READ_WRITE_TOKEN
          ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
          : {},
      });
      if (res.ok) {
        const data = await res.json();
        return data as Person[];
      }
    }
  } catch {
    // Return empty rather than falling back to stale hardcoded data
  }
  return [];
}

export async function savePeople(people: Person[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Vercel Blob storage is required to save data."
    );
  }
  const { put, list, del } = await getBlobModule();
  // Delete any existing blobs at this path before writing
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch {
    // Ignore deletion errors — put will still succeed
  }
  await put(BLOB_FILENAME, JSON.stringify(people, null, 2), {
    access: "public",          // Public so the URL is directly fetchable server-side
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
