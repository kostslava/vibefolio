import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Wrap raw 16-bit PCM (24 kHz mono) in a WAV container. */
function pcmToWav(pcmBase64: string, sampleRate = 24000, channels = 1, bits = 16): string {
  const pcm = Buffer.from(pcmBase64, "base64");
  const dataLen = pcm.length;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + dataLen, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);                             // PCM
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * channels * (bits / 8), 28);
  h.writeUInt16LE(channels * (bits / 8), 32);
  h.writeUInt16LE(bits, 34);
  h.write("data", 36);
  h.writeUInt32LE(dataLen, 40);
  return Buffer.concat([h, pcm]).toString("base64");
}

async function gemini(model: string, body: object, apiKey: string) {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const { question, systemContext } = await req.json();
    if (!question?.trim() || !systemContext?.trim()) {
      return NextResponse.json({ error: "Missing question or context" }, { status: 400 });
    }

    // Step 1 – generate text with Gemini 2.5 Flash
    const { res: textRes, data: textData } = await gemini(
      "gemini-2.5-flash",
      {
        system_instruction: { parts: [{ text: systemContext }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
      },
      apiKey
    );
    const text: string = textData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!textRes.ok || !text) {
      const msg = textData.error?.message ?? "Empty text response";
      return NextResponse.json({ error: msg }, { status: textRes.ok ? 500 : textRes.status });
    }

    // Step 2 – convert text to native audio with Gemini 2.5 Flash TTS
    const { res: ttsRes, data: ttsData } = await gemini(
      "gemini-2.5-flash-preview-tts",
      {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
        },
      },
      apiKey
    );
    const pcmBase64: string =
      ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? "";

    if (!ttsRes.ok || !pcmBase64) {
      // TTS failed – return text only so the client can still show it
      console.error("[/api/ask] TTS error:", ttsData.error?.message);
      return NextResponse.json({ text });
    }

    return NextResponse.json({ text, audioBase64: pcmToWav(pcmBase64) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ask]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
