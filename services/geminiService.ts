
import { GoogleGenAI, Type } from "@google/genai";
import { Inspiration, ArtStyle } from "../types";
import { STYLE_MODIFIERS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generatePortrait(subject: string, style: ArtStyle): Promise<string> {
  const modifiers = STYLE_MODIFIERS[style];
  const fullPrompt = `${subject}, ${modifiers}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: fullPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini API");
}

export async function generateInspirationNotes(subject: string, style: ArtStyle): Promise<Inspiration> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this portrait subject: "${subject}" created in "${style}" style. Provide artistic inspiration notes for a painter.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technique: {
            type: Type.STRING,
            description: `A specific technique related to ${style} to try.`
          },
          palette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 pigment names or color descriptions."
          },
          mood: {
            type: Type.STRING,
            description: "The emotional tone of the piece."
          },
          challenge: {
            type: Type.STRING,
            description: "A creative challenge for the artist."
          }
        },
        required: ["technique", "palette", "mood", "challenge"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}
