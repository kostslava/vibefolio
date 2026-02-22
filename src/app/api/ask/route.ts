import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  header.writeUInt16LE(1, 20);
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

    const audioParts: Buffer[] = [];

    const audioBase64 = await new Promise<string | null>((resolve, reject) => {
      ai.live
        .connect({
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemContext,
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
          },
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onmessage: (msg: any) => {
              const parts = msg?.serverContent?.modelTurn?.parts ?? [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  audioParts.push(Buffer.from(part.inlineData.data, "base64"));
                }
              }
              if (msg?.serverContent?.turnComplete) {
                resolve(
                  audioParts.length > 0
                    ? pcmToWav(Buffer.concat(audioParts)).toString("base64")
                    : null
                );
              }
            },
            onerror: (e: unknown) => reject(new Error(String(e))),
          },
        })
        .then((session) => {
          session.sendClientContent({
            turns: [{ role: "user", parts: [{ text: question }] }],
            turnComplete: true,
          });
        })
        .catch(reject);
    });

    return NextResponse.json({ audioBase64 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ask]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
