'use client'

import { useState } from 'react';
import { generateImage } from '@/app/actions/gemini';

interface UploadedImage {
  file: File;
  preview: string;
  mimeType: string;
  base64: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text?: string;
  image?: string;
  images?: UploadedImage[];
}

interface ChatSessionData {
  sessionId?: string;
  history: any[];
}

export default function GeminiDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        mimeType: file.type,
        base64
      });
    }

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() && uploadedImages.length === 0) {
      setError('プロンプトまたは画像を追加してください');
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      text: prompt,
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const imageData = uploadedImages.map(img => ({
        mimeType: img.mimeType,
        data: img.base64
      }));

      const response = await generateImage(
        prompt,
        imageData.length > 0 ? imageData : undefined
      );

      if (response.success && response.data) {
        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          text: response.data.text || undefined,
          image: response.data.image || undefined
        };

        setChatMessages(prev => [...prev, assistantMessage]);

        // Clear input
        setPrompt("");
        setUploadedImages([]);
      } else {
        setError(response.error || 'Failed to send message');
      }
    } catch (err) {
      setError('An error occurred while sending message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-gray-900">Gemini API Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                ホームに戻る
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Gemini チャットデモ
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            会話形式で画像生成・編集ができます
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-lg mb-6 h-96 overflow-y-auto p-4">
          <div className="space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                会話を始めましょう！
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.text && <p className="text-sm">{message.text}</p>}

                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {message.images.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img.preview}
                            alt={`User image ${imgIndex + 1}`}
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    {message.image && (
                      <div className="mt-2">
                        <img
                          src={message.image}
                          alt="Generated image"
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                メッセージを入力
              </label>
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="メッセージを入力してください..."
              />
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                画像アップロード（複数可）
              </label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  アップロード済み画像 ({uploadedImages.length}枚)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transform translate-x-1 -translate-y-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!prompt.trim() && uploadedImages.length === 0)}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                  isLoading || (!prompt.trim() && uploadedImages.length === 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isLoading ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}