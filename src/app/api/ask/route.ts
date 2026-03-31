import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

/**
 * Wraps raw s16le PCM bytes in a WAV container so browsers can play it.
 * Gemini TTS returns 24 000 Hz mono PCM.
 */
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);         // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });
    const { question, systemContext } = await req.json();

    if (!question?.trim() || !systemContext?.trim()) {
      return NextResponse.json(
        { error: "Missing question or context" },
        { status: 400 }
      );
    }

    // ── Step 1: get a text answer from Gemini 2.5 Flash ─────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textResp = await (ai.models as any).generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: question }] }],
      config: { systemInstruction: systemContext },
    });

    const text: string =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (textResp as any).candidates?.[0]?.content?.parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((p: any) => p.text ?? "")
        .join("") ?? "";

    if (!text) {
      return NextResponse.json({ audioBase64: null, text: "" });
    }

    // ── Step 2: speak the answer with Gemini 2.5 Flash TTS ──────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ttsResp = await (ai.models as any).generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });

    let audioBase64: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ttsResp as any).candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (!part.inlineData) continue;
      const mimeType: string = part.inlineData.mimeType ?? "";
      const rawB64: string = part.inlineData.data ?? "";

      if (
        mimeType.startsWith("audio/pcm") ||
        mimeType.startsWith("audio/raw") ||
        mimeType.startsWith("audio/l16")
      ) {
        const rateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        audioBase64 = pcmToWav(Buffer.from(rawB64, "base64"), sampleRate).toString("base64");
      } else if (mimeType.startsWith("audio/")) {
        audioBase64 = rawB64;
      }
    }

    return NextResponse.json({ audioBase64, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ask]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
