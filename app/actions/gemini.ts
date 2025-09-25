'use server'

import { GoogleGenAI, Chat } from "@google/genai";

interface ImageData {
  mimeType: string;
  data: string;
}

const chatSessions: Map<string, Chat> = new Map();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key is not configured');
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});

export async function createChatSession(): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash-image-preview",
  });
  const sessionId = crypto.randomUUID();
  chatSessions.set(sessionId, chat);
  return sessionId;
}

export async function generateImage(sessionId: string, prompt: string, images?: ImageData[]) {
  try {
    const chat = chatSessions.get(sessionId);
    if (!chat) {
      throw new Error('Invalid chat session ID');
    }
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

    const response = await chat.sendMessage({ message: contents });

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
