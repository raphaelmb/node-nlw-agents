import { GoogleGenAI } from "@google/genai"
import { env } from "../env.ts"

const gemini = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
})

const model = "gemini-2.5-flash"

async function transcribeAudio(audioAsBase64: string, mimeType: string) {
    const response = await gemini.models.generateContent({
        model,
        contents: [
            {
                text: "Transcribe the audio. Be precise and natural in the transcription. Keep the punctuation and divide the text in paragraphs when needed"
            },
            {
                inlineData: {
                    mimeType,
                    data: audioAsBase64
                }
            }
        ]
    })

    if (!response.text) throw new Error("Could not convert audio")

    return response.text
}