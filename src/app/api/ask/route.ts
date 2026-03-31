import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

/**
 * Wraps raw PCM audio bytes in a proper WAV container so browsers can play it.
 * Gemini Native Audio returns s16le PCM at 24 000 Hz, mono.
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
  header.writeUInt32LE(16, 16);        // Subchunk1Size
  header.writeUInt16LE(1, 20);         // AudioFormat: PCM
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
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });
    const { question, systemContext } = await req.json();

    if (!question?.trim() || !systemContext?.trim()) {
      return NextResponse.json(
        { error: "Missing question or context" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (ai.models as any).generateContent({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      contents: [{ role: "user", parts: [{ text: question }] }],
      config: {
        systemInstruction: systemContext,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    let audioBase64: string | null = null;
    let text = "";

    const parts =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response as any).candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData) {
        const mimeType: string = part.inlineData.mimeType ?? "";
        const rawB64: string = part.inlineData.data ?? "";

        if (mimeType.startsWith("audio/pcm") || mimeType.startsWith("audio/raw") || mimeType.startsWith("audio/l16")) {
          // Parse sample rate from e.g. "audio/pcm;rate=24000"
          const rateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          const pcm = Buffer.from(rawB64, "base64");
          audioBase64 = pcmToWav(pcm, sampleRate).toString("base64");
        } else if (mimeType.startsWith("audio/")) {
          // Already in a browser-playable container (e.g. audio/wav, audio/mp3)
          audioBase64 = rawB64;
        }
      }

      if (part.text) {
        text += part.text;
      }
    }

    return NextResponse.json({ audioBase64, text: text || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ask] Gemini error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
