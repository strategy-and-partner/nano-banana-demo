'use client'

import { useState, useRef } from 'react';

interface UploadedImage {
  file: File;
  preview: string;
  mimeType: string;
  base64: string;
}

interface AddReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'replace';
  onComplete: (description: string, image?: UploadedImage) => void;
}

export default function AddReplaceModal({ isOpen, onClose, mode, onComplete }: AddReplaceModalProps) {
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    const base64 = await base64Promise;

    setUploadedImage({
      file,
      preview: URL.createObjectURL(file),
      mimeType: file.type,
      base64
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleComplete = () => {
    if (description.trim()) {
      onComplete(description.trim(), uploadedImage || undefined);
      // Reset form
      setDescription('');
      setUploadedImage(null);
      onClose();
    }
  };

  const canProceed = description.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? '🔧 要素を追加' : '🔄 要素を置き換え'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-lg font-medium text-gray-800 mb-3">
                {mode === 'add' ? '何を追加しますか？' : '何と置き換えますか？'}
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                placeholder={mode === 'add'
                  ? "例: 木製のテーブル、観葉植物、アンティークの照明..."
                  : "例: 椅子を革張りのソファに、照明をシャンデリアに..."
                }
              />
            </div>

            {/* Image Upload (Optional) */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-3">
                参考画像（任意）
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : uploadedImage
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage.preview}
                      alt="Uploaded"
                      className="max-h-32 mx-auto rounded-lg"
                    />
                    <div className="text-sm text-green-600">✓ 参考画像がアップロードされました</div>
                    <button
                      onClick={() => {
                        if (uploadedImage) {
                          URL.revokeObjectURL(uploadedImage.preview);
                          setUploadedImage(null);
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">画像をドラッグ&ドロップ</p>
                      <p className="text-gray-500 mb-3">または</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        ファイルを選択
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>

            <button
              onClick={handleComplete}
              disabled={!canProceed}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                canProceed
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {mode === 'add' ? '追加実行' : '置き換え実行'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}