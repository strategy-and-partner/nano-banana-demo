'use server'

import { GoogleGenAI } from "@google/genai";

interface ImageData {
  mimeType: string;
  data: string;
}

interface ChatSessionData {
  sessionId?: string;
  history: any[];
}

export async function generateImage(prompt: string, images?: ImageData[]) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    // Build the contents array
    let contents: any = [];

    // Add text prompt
    if (prompt) {
      contents.push({ text: prompt });
    }

    // Add images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        contents.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          }
        });
      }
    }

    // If only text, use simple string format
    if (contents.length === 1 && contents[0].text) {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    const result = {
      text: null as string | null,
      image: null as string | null
    };

    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        const parts = candidate.content.parts;

        for (const part of parts) {
          if (part.text) {
            result.text = part.text;
          } else if (part.inlineData && part.inlineData.mimeType && part.inlineData.data) {
            result.image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    };
  }
}
