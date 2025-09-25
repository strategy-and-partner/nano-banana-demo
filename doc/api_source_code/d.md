```typescript
import { GoogleGenAI, ChatSession, Content, Part } from "@google/genai";

// 環境変数などで apiKey を設定しておく
const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

// クライアント初期化
const ai = new GoogleGenAI({
  apiKey: apiKey,
  // vertexai を使うなら { vertexai: true, project, location } オプションを使う
});

// チャットセッションを作る
async function createChatSession(): Promise<ChatSession> {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash-image-preview",
  });

  return chat;
}

// チャットでメッセージを送る（テキスト or 編集指示付き）
async function sendChat(
  chat: ChatSession,
  userText: string,
  baseImageBase64?: string
) {
  // 入力コンテンツを組み立て
  const contents: Part[] = [{ text: userText }];

  if (baseImageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/png", // 適宜 mimeType を変えて
        data: baseImageBase64,
      },
    });
  }

  const resp = await chat.sendMessage({
    parts: contents
  });

  // 応答からテキストと画像を取り出す
  const respText = resp.text();  // テキスト応答
  const respImages: string[] = []; // base64 形式画像を格納するリスト

  for (const cp of resp.content.parts) {
    if (cp.inlineData) {
      respImages.push(cp.inlineData.data);
    }
  }

  return {
    text: respText,
    images: respImages,
  };
}

// 実行例
(async () => {
  const chat = await createChatSession();

  // 最初は画像なしで編集指示を送る例
  let result = await sendChat(chat, "まず青い猫を描いてください");
  console.log("応答テキスト:", result.text);
  if (result.images.length > 0) {
    console.log("生成された画像（base64）:", result.images[0]);
  }

  // 次に「その猫に帽子をかぶせて」と、前画像を渡して編集を指示する例
  if (result.images.length > 0) {
    const prevImg = result.images[0];
    result = await sendChat(chat, "その猫に赤い帽子をかぶせて", prevImg);
    console.log("応答2:", result.text);
    if (result.images.length > 0) {
      console.log("編集後画像:", result.images[0]);
    }
  }
})();
```