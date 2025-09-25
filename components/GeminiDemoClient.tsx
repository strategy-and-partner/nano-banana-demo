'use client'

import { useState, useEffect } from 'react';
import { generateImage, generateRestaurantDesign, createChatSession } from '@/app/actions/gemini';
import RestaurantDesignModal from '@/components/RestaurantDesignModal';
import AddReplaceModal from '@/components/AddReplaceModal';
import TextbookModal from '@/components/TextbookModal';
import { TextbookItem } from '@/lib/textbook-data';
import Link from 'next/link'


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

interface DesignPreferences {
  casualToLuxury: number;
  brightToDark: number;
  simpleToDecorative: number;
  modernToTraditional: number;
}

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ src, alt, isOpen, onClose }: ImageModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="relative max-w-full sm:max-w-4xl w-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 sm:p-3 transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GeminiDemoClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [modalMode, setModalMode] = useState<'full' | 'cuisine' | 'preferences'>('full');
  const [hasCompletedInitialDesign, setHasCompletedInitialDesign] = useState(false);
  const [currentCuisineSelections, setCurrentCuisineSelections] = useState<string[]>([]);
  const [currentDesignPreferences, setCurrentDesignPreferences] = useState<DesignPreferences>({
    casualToLuxury: 2,
    brightToDark: 2,
    simpleToDecorative: 2,
    modernToTraditional: 2
  });
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [showAddReplaceModal, setShowAddReplaceModal] = useState(false);
  const [addReplaceMode, setAddReplaceMode] = useState<'add' | 'replace'>('add');
  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [selectedTextbookItems, setSelectedTextbookItems] = useState<TextbookItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeSession = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      // セッション初期化完了後にモーダルを表示
      setShowRestaurantModal(true);
    } catch (err) {
      console.error('Failed to create chat session:', err);
      setError('チャットセッションの初期化に失敗しました。しばらくしてから再試行してください。');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

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

  const handleRestaurantDesignComplete = async (
    image: UploadedImage,
    selections: string[],
    preferences: DesignPreferences
  ) => {
    if (!sessionId) {
      setError('チャットセッションが初期化されていません');
      return;
    }

    setShowRestaurantModal(false);
    setIsLoading(true);
    setError(null);

    try {
      const imageData = {
        mimeType: image.mimeType,
        data: image.base64
      };

      const response = await generateRestaurantDesign(
        sessionId,
        selections,
        preferences,
        imageData
      );

      if (response.success && response.data) {
        // Save current selections and original image
        setCurrentCuisineSelections(selections);
        setCurrentDesignPreferences(preferences);
        setOriginalImage(image);

        // Add initial design result to chat
        const initialMessage: ChatMessage = {
          role: 'assistant',
          text: response.data.text || '🏪 レストランデザインを生成しました！さらなる調整をご希望でしたら、チャットでお聞かせください。',
          image: response.data.image || undefined
        };

        setChatMessages([initialMessage]);
        setHasCompletedInitialDesign(true);
      } else {
        setError(response.error || 'デザイン生成に失敗しました');
      }
    } catch (err) {
      setError('デザイン生成中にエラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReplace = async (description: string, image?: UploadedImage) => {
    if (!sessionId) {
      setError('チャットセッションが初期化されていません');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate prompt based on mode
      const actionText = addReplaceMode === 'add' ? 'を追加' : 'を既存のものとすべて置き換え';
      const basePrompt = `画像は${description}です。その${description}${actionText}て`;
      const finalPrompt = generatePromptWithTextbook(basePrompt);

      const imageData = image ? [{
        mimeType: image.mimeType,
        data: image.base64
      }] : undefined;

      const response = await generateImage(
        sessionId,
        finalPrompt,
        imageData
      );

      if (response.success && response.data) {
        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          text: response.data.text || undefined,
          image: response.data.image || undefined
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('An error occurred while processing request');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextbookSelection = async (selectedItems: TextbookItem[]) => {
    setSelectedTextbookItems(selectedItems);

    if (!sessionId) {
      setError('チャットセッションが初期化されていません');
      return;
    }

    if (selectedItems.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const textbookText = selectedItems.map(item => `${item.id}: ${item.title}`).join('\n');
      const prompt = `以下は該当する要素があれば規定通りにしたがってほしい：\n${textbookText}`;

      const response = await generateImage(
        sessionId,
        prompt,
        undefined
      );

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          text: response.data.text || undefined,
          image: response.data.image || undefined
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('An error occurred while processing request');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePromptWithTextbook = (basePrompt: string): string => {
    if (selectedTextbookItems.length === 0) {
      return basePrompt;
    }

    const textbookText = selectedTextbookItems.map(item => `${item.id}: ${item.title}`).join('\n');
    return `${basePrompt}\n\n以下は該当する要素があれば規定通りにしたがってほしい：\n${textbookText}`;
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() && uploadedImages.length === 0) {
      setError('プロンプトまたは画像を追加してください');
      return;
    }

    if (!sessionId) {
      setError('チャットセッションが初期化されていません');
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

      const finalPrompt = generatePromptWithTextbook(prompt);

      const response = await generateImage(
        sessionId,
        finalPrompt,
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

  // セッション初期化中のローディング画面
  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Header */}
        <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-base sm:text-xl font-bold text-white block truncate">🏪 レストランデザインAI</span>
                  <p className="text-xs text-white/60 mt-0.5 hidden sm:block">飲食店のデザインを効率的に生成・編集</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">セッションを初期化しています</h2>
            <p className="text-white/70">少々お待ちください...</p>
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-300/50 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-red-100 text-sm mb-3">{error}</p>
                <button
                  onClick={initializeSession}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-xl font-bold text-white block truncate">🏪 レストランデザインAI</span>
                <p className="text-xs text-white/60 mt-0.5 hidden sm:block">飲食店のデザインを効率的に生成・編集</p>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-white/80 hover:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all hover:bg-white/10"
              >
                <span className="hidden sm:inline">← ホームに戻る</span>
                <span className="sm:hidden">← 戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-full sm:max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6 gap-3 sm:gap-6">

        {/* Chat Container */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="h-full flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
              {chatMessages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <p className="text-xl font-medium">レストランデザイン完了！</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {hasCompletedInitialDesign
                      ? 'さらなる調整や変更をご希望でしたら、チャットでお聞かせください'
                      : '画像をアップロードして、理想のレストランデザインを生成しましょう'
                    }
                  </p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-2xl px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}

                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {message.images.map((img, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={img.preview}
                              alt={`User image ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setModalImage({ src: img.preview, alt: `User image ${imgIndex + 1}` })}
                            />
                          ))}
                        </div>
                      )}

                      {message.image && (
                        <div className="mt-3">
                          <img
                            src={message.image}
                            alt="Generated image"
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setModalImage({ src: message.image!, alt: "Generated image" })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="text-gray-600">AIが考えています...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-gray-50/50 p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <textarea
                    id="prompt"
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                    placeholder="メッセージを入力してください..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">画像を追加</span>
                      </div>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {uploadedImages.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {uploadedImages.length}枚の画像
                        </span>
                        <div className="flex space-x-1">
                          {uploadedImages.slice(0, 3).map((img, index) => (
                            <div key={index} className="relative">
                              <img
                                src={img.preview}
                                alt={`Upload ${index + 1}`}
                                className="w-8 h-8 object-cover rounded cursor-pointer"
                                onClick={() => setModalImage({ src: img.preview, alt: `Upload ${index + 1}` })}
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          {uploadedImages.length > 3 && (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{uploadedImages.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Design Change Buttons */}
                    {hasCompletedInitialDesign && (
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setModalMode('cuisine');
                            setShowRestaurantModal(true);
                          }}
                          className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-orange-700">料理変更</span>
                        </button>

                        <button
                          onClick={() => {
                            setModalMode('preferences');
                            setShowRestaurantModal(true);
                          }}
                          className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-blue-700">雰囲気変更</span>
                        </button>

                        <button
                          onClick={() => {
                            setAddReplaceMode('add');
                            setShowAddReplaceModal(true);
                          }}
                          className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-green-700">要素を追加</span>
                        </button>

                        <button
                          onClick={() => {
                            setAddReplaceMode('replace');
                            setShowAddReplaceModal(true);
                          }}
                          className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-purple-700">要素を置き換え</span>
                        </button>

                        <button
                          onClick={() => setShowTextbookModal(true)}
                          className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors col-span-2 sm:col-span-1"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-amber-700">
                            教科書 {selectedTextbookItems.length > 0 && `(${selectedTextbookItems.length})`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!prompt.trim() && uploadedImages.length === 0)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      isLoading || (!prompt.trim() && uploadedImages.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span>送信中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>送信</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      <ImageModal
        src={modalImage?.src || ''}
        alt={modalImage?.alt || ''}
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
      />

      {/* Restaurant Design Modal */}
      <RestaurantDesignModal
        isOpen={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
        onComplete={handleRestaurantDesignComplete}
        mode={modalMode}
        initialImage={modalMode !== 'full' ? originalImage || undefined : undefined}
        initialSelections={modalMode === 'cuisine' || modalMode === 'full' ? currentCuisineSelections : undefined}
        initialPreferences={modalMode === 'preferences' || modalMode === 'full' ? currentDesignPreferences : undefined}
      />

      {/* Add/Replace Modal */}
      <AddReplaceModal
        isOpen={showAddReplaceModal}
        onClose={() => setShowAddReplaceModal(false)}
        mode={addReplaceMode}
        onComplete={handleAddReplace}
      />

      {/* Textbook Modal */}
      <TextbookModal
        isOpen={showTextbookModal}
        onClose={() => setShowTextbookModal(false)}
        onComplete={handleTextbookSelection}
        initialSelectedIds={selectedTextbookItems.map(item => item.id)}
      />
    </div>
  );
}