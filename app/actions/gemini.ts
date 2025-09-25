'use server'

import { GoogleGenAI, Chat, PartListUnion } from "@google/genai";

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

interface DesignPreferences {
  casualToLuxury: number;
  brightToDark: number;
  simpleToDecorative: number;
  modernToTraditional: number;
}

function generateRestaurantDesignPrompt(
  selectedItems: string[],
  preferences: DesignPreferences
): string {
  const styleMap = {
    casualToLuxury: ['カジュアルで親しみやすい', '居心地の良い温かい', '上品で洗練された', '高級でプレミアムな'],
    brightToDark: ['自然光で明るく開放的な', '暖かい雰囲気で明るい', '柔らかい照明で親密な', 'ムード照明でドラマチックな'],
    simpleToDecorative: ['清潔でミニマルな', '上品に装飾された', '豊かに装飾された', '華麗で精巧な'],
    modernToTraditional: ['現代的でモダンな', 'クラシカルな要素を持つモダンな', 'モダンな要素を持つ伝統的な', 'クラシックで伝統的な']
  };

  const styleDescriptions = Object.entries(preferences).map(([key, value]) =>
    styleMap[key as keyof typeof styleMap][value - 1]
  );

  return `この画像はこれからデザインを考える、追加していく元画像です。もと画像の構造や広さ、角度などをかえないで以下のようなデザインに変更して：

・料理ジャンル：${selectedItems.join('、')}
・スタイル：${styleDescriptions[0]}
・明るさ：${styleDescriptions[1]}
・装飾度：${styleDescriptions[2]}
・時代感：${styleDescriptions[3]}`;
}

export async function generateRestaurantDesign(
  sessionId: string,
  selectedItems: string[],
  preferences: DesignPreferences,
  originalImage: ImageData
) {
  try {
    const chat = chatSessions.get(sessionId);
    if (!chat) {
      throw new Error('Invalid chat session ID');
    }

    const prompt = generateRestaurantDesignPrompt(selectedItems, preferences);

    const contents: PartListUnion = [];

    contents.push({ text: prompt });

    contents.push({
      inlineData: {
        mimeType: originalImage.mimeType,
        data: originalImage.data,
      }
    });

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
      error: error instanceof Error ? error.message : 'Failed to generate restaurant design'
    };
  }
}

export async function generateImage(sessionId: string, prompt: string, images?: ImageData[]) {
  try {
    const chat = chatSessions.get(sessionId);
    if (!chat) {
      throw new Error('Invalid chat session ID');
    }
    // Build the contents array
    const contents: PartListUnion = [];

    // Add text prompt
    if (prompt) {
      contents.push({ text: "もと画像の構造や広さ、角度などをかえないで以下のようなデザインに変更して" +prompt });
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
