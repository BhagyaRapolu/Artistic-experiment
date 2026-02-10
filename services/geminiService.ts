
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
      contents: `You are a creative muse for a master painter. Convert the concept "${baseIdea}" into a 12-word sensory-rich prompt. Focus on light, texture, and mood. No quotes.`,
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
    const fullPrompt = `A masterful ${style.toLowerCase()} painting of ${subject}. ${modifiers}. Use professional artistic composition, dramatic lighting, and museum-quality textures.`;
    
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

  // Fix: Use cacheKey instead of undefined requestId to track pending requests
  pendingRequests.set(cacheKey, promise);
  return promise;
}

export async function editImage(base64Image: string, prompt: string, style: ArtStyle, aspectRatio: AspectRatio): Promise<string> {
  const promise = withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modifiers = STYLE_MODIFIERS[style];
    const fullPrompt = `Re-imagine this piece as a ${style.toLowerCase()}: ${modifiers}. ${prompt ? `Modifications: ${prompt}` : ''}. Maintain the core soul of the image but apply the specific physical properties of ${style}.`;
    
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
          { text: `You are a world-renowned art critic and professor. Analyze this ${style} study of "${subject}". 
          1. Technique: Describe the specific brushwork or tool usage (e.g., 'wet-on-wet washes', 'heavy impasto'). 
          2. Palette: List 4 specific pigments used (e.g., 'Burnt Sienna', 'Prussian Blue'). 
          3. Mood: The emotional weight. 
          4. Challenge: One technical hurdle a student would face mimicking this. 
          Format as JSON.` },
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
