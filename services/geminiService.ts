
import { GoogleGenAI, Type } from "@google/genai";
import { Inspiration, ArtStyle } from "../types";
import { STYLE_MODIFIERS, DEFAULT_SUBJECTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRandomSubject(): Promise<string> {
  const baseIdea = DEFAULT_SUBJECTS[Math.floor(Math.random() * DEFAULT_SUBJECTS.length)];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this simple painting idea into a rich, evocative, and highly descriptive artistic prompt: "${baseIdea}". 
    Describe the lighting, atmospheric mood, and specific fine details that would make a beautiful painting. 
    Keep the output under 25 words. Do not use quotes or introductory text.`,
    config: {
      temperature: 0.8,
    }
  });

  if (!response.text) return baseIdea;
  return response.text.trim().replace(/^["'*]+|["'*]+$/g, '');
}

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

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from Gemini API");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in candidate parts");
}

export async function editImage(base64Image: string, prompt: string, style: ArtStyle): Promise<string> {
  const modifiers = STYLE_MODIFIERS[style];
  const fullPrompt = `Re-imagine the attached image in the following artistic style: ${modifiers}. 
  ${prompt ? `Additionally, apply these specific creative changes: ${prompt}.` : 'Preserve the core composition while transforming the medium completely.'}`;
  
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: fullPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from Gemini API");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in candidate parts");
}

export async function generateInspirationNotes(imageUrl: string, subject: string, style: ArtStyle): Promise<Inspiration> {
  // Optimization: Send the actual generated image to Gemini 3 Flash to get a real analysis of the art
  const base64Data = imageUrl.split(',')[1];
  const mimeType = imageUrl.split(',')[0].split(':')[1].split(';')[0];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { 
          text: `Analyze this newly generated ${style} painting of "${subject}". 
          Provide technical artistic notes for a student who wants to recreate this specific look. 
          Be specific about the colors and techniques visible in THIS specific image.`
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technique: {
            type: Type.STRING,
            description: "A specific brushwork or medium technique seen in the image."
          },
          palette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 dominant pigment colors identified in the image."
          },
          mood: {
            type: Type.STRING,
            description: "The emotional resonance of the composition."
          },
          challenge: {
            type: Type.STRING,
            description: "A difficult aspect of this specific piece to master."
          }
        },
        required: ["technique", "palette", "mood", "challenge"]
      }
    }
  });

  if (!response.text) throw new Error("Empty response from inspiration service");
  
  return JSON.parse(response.text.trim());
}
