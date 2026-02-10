
import { GoogleGenAI, Type } from "@google/genai";
import { Inspiration, ArtStyle, AspectRatio } from "../types";
import { STYLE_MODIFIERS, DEFAULT_SUBJECTS } from "../constants";

const sessionCache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>();

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || "";
    const status = error?.status;
    const isPermanent = retries <= 0 || status === 400 || errorMsg.includes('safety') || errorMsg.includes('filtered');

    if (isPermanent) {
      if (errorMsg.includes('safety') || errorMsg.includes('filtered')) {
        throw new Error("moderated_content");
      }
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

const getCacheKey = (prefix: string, parts: any[]) => {
  return `${prefix}_${parts.map(p => typeof p === 'string' ? p.trim().toLowerCase() : JSON.stringify(p)).join('_')}`;
};

export async function generateRandomSubject(): Promise<string> {
  const requestId = 'random_subject_gen';
  if (pendingRequests.has(requestId)) return pendingRequests.get(requestId);

  const promise = withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const baseIdea = DEFAULT_SUBJECTS[Math.floor(Math.random() * DEFAULT_SUBJECTS.length)];
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Imagine a world-class artist's sketchbook. Convert "${baseIdea}" into a 12-word evocative prompt. No quotes.`,
      config: { temperature: 0.9 }
    });

    return response.text?.trim().replace(/^["'*]+|["'*]+$/g, '') || baseIdea;
  }).finally(() => pendingRequests.delete(requestId));

  pendingRequests.set(requestId, promise);
  return promise;
}

export async function generatePortrait(subject: string, style: ArtStyle, aspectRatio: AspectRatio): Promise<string> {
  const cacheKey = getCacheKey('img', [subject, style, aspectRatio]);
  if (sessionCache.has(cacheKey)) return sessionCache.get(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const promise = withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modifiers = STYLE_MODIFIERS[style];
    const fullPrompt = `${subject}, fine art ${style.toLowerCase()}, ${modifiers}, masterpiece, professional composition, 8k resolution`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio } }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("empty_response");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
        sessionCache.set(cacheKey, dataUrl);
        return dataUrl;
      }
    }
    throw new Error("no_image_data");
  }).finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, promise);
  return promise;
}

export async function editImage(base64Image: string, prompt: string, style: ArtStyle, aspectRatio: AspectRatio): Promise<string> {
  const requestId = `edit_${Date.now()}`;
  const promise = withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modifiers = STYLE_MODIFIERS[style];
    const fullPrompt = `Re-imagine this artwork in the style of ${style}: ${modifiers}. ${prompt ? `Apply these changes: ${prompt}` : ''}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: fullPrompt },
        ],
      },
      config: { imageConfig: { aspectRatio } }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("edit_blocked");

    for (const part of candidate.content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("edit_failed");
  });

  return promise;
}

export async function generateInspirationNotes(imageUrl: string, subject: string, style: ArtStyle): Promise<Inspiration> {
  const cacheKey = getCacheKey('notes', [subject, style]);
  if (sessionCache.has(cacheKey)) return sessionCache.get(cacheKey);

  const promise = withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageUrl.split(',')[1], mimeType: 'image/png' } },
          { text: `Analyze this ${style} painting of "${subject}". Provide technical notes for an artist in JSON.` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technique: { type: Type.STRING },
            palette: { type: Type.ARRAY, items: { type: Type.STRING } },
            mood: { type: Type.STRING },
            challenge: { type: Type.STRING }
          },
          required: ["technique", "palette", "mood", "challenge"]
        }
      }
    });

    const notes = JSON.parse(response.text || '{}');
    sessionCache.set(cacheKey, notes);
    return notes;
  });

  return promise;
}
