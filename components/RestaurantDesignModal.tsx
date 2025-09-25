'use client'

import { useState, useRef } from 'react';

interface UploadedImage {
  file: File;
  preview: string;
  mimeType: string;
  base64: string;
}

interface DesignPreferences {
  casualToLuxury: number; // 1-4 (1: casual, 4: luxury)
  brightToDark: number; // 1-4 (1: bright, 4: dark)
  simpleToDecorative: number; // 1-4 (1: simple, 4: decorative)
  modernToTraditional: number; // 1-4 (1: modern, 4: traditional)
}

interface RestaurantDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (image: UploadedImage, selections: string[], preferences: DesignPreferences) => void;
  mode?: 'full' | 'cuisine' | 'preferences';
  initialImage?: UploadedImage;
  initialSelections?: string[];
  initialPreferences?: DesignPreferences;
}

const FOOD_GENRES = [
  '和食', '洋食', '中華', 'イタリアン', 'フレンチ', 'カフェ', 'バー', '居酒屋',
  '韓国料理', 'タイ料理', 'インド料理', 'メキシカン', '焼肉', '寿司', 'ラーメン',
  'ファストフード', 'ベーカリー', 'スイーツ', 'スペイン料理', 'トルコ料理',
  'ベトナム料理', '台湾料理', '香港料理', 'アメリカン', 'ロシア料理', 'ギリシャ料理',
  'ブラジル料理', 'アルゼンチン料理', 'ペルー料理', 'モロッコ料理', 'エチオピア料理',
  'レバノン料理', 'ネパール料理', 'パキスタン料理', 'インドネシア料理', 'マレーシア料理',
  'シンガポール料理', 'フィリピン料理', '沖縄料理', '九州料理', '関西料理', '東北料理',
  '北海道料理', 'ジャマイカ料理', 'キューバ料理', 'ドイツ料理', 'オーストリア料理',
  'スイス料理', 'オランダ料理', 'ベルギー料理', 'イギリス料理', 'アイルランド料理',
  'スカンジナビア料理', 'ポーランド料理', 'チェコ料理', 'ハンガリー料理'
];

const SPECIFIC_DISHES = [
  'ハンバーガー', 'パスタ', 'ピザ', 'ステーキ', '天ぷら', '餃子', 'カレー',
  'タコス', 'パンケーキ', 'ドーナツ', 'サンドイッチ', 'オムライス', 'とんかつ',
  '唐揚げ', '焼き鳥', 'うどん', 'そば', 'お好み焼き', 'たこ焼き', 'チャーハン',
  'ビビンバ', 'トムヤムクン', 'ナン', 'ブリトー', 'クロワッサン', 'ケーキ',
  'パエリア', 'リゾット', 'グラタン', 'キッシュ', 'クレープ', 'ワッフル', 'バゲット',
  'クラムチャウダー', 'オニオンスープ', 'ミネストローネ', 'ガスパチョ', 'フォー',
  'パッタイ', 'ソムタム', 'プルコギ', 'チヂミ', 'キムチ鍋', 'サムギョプサル',
  'マーボー豆腐', '回鍋肉', '青椒肉絲', '酢豚', '小籠包', '点心', '北京ダック',
  'タンドリーチキン', 'ビリヤニ', 'サモサ', 'チャイ', 'ラッシー', 'モモ',
  'ケバブ', 'ファラフェル', 'フムス', 'タブレ', 'バクラヴァ', 'ドルマ',
  'ボルシチ', 'ペリメニ', 'ストロガノフ', 'ピロシキ', 'ブリヌイ',
  'パンチェッタ', 'ジェラート', 'カルパッチョ', 'ブルスケッタ', 'フォカッチャ',
  'パニーニ', 'カプレーゼ', 'ミラノ風リゾット', 'カルボナーラ', 'ボロネーゼ',
  'シーザーサラダ', 'コブサラダ', 'BBQリブ', 'フライドチキン', 'マカロニチーズ',
  'チリコンカン', 'ナチョス', 'ケサディーヤ', 'エンチラーダ', 'ファヒータ',
  '春巻き', '麻婆茄子', '棒々鶏', '担々麺', '冷やし中華', '五目炒飯', '酸辣湯',
  'お刺身', '天丼', '親子丼', '牛丼', 'カツ丼', '海鮮丼', 'ちらし寿司', '握り寿司',
  '焼き魚', '煮物', 'すき焼き', 'しゃぶしゃぶ', '鍋料理', 'おでん', '味噌汁',
  'エスプレッソ', 'カプチーノ', 'ラテ', 'フラペチーノ', 'スムージー', 'タピオカ',
  'アフタヌーンティー', 'スコーン', 'マフィン', 'ベーグル', 'フレンチトースト'
];

export default function RestaurantDesignModal({
  isOpen,
  onClose,
  onComplete,
  mode = 'full',
  initialImage,
  initialSelections = [],
  initialPreferences
}: RestaurantDesignModalProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (mode === 'cuisine') return 2;
    if (mode === 'preferences') return 3;
    return 1;
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(initialImage || null);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelections);
  const [preferences, setPreferences] = useState<DesignPreferences>(
    initialPreferences || {
      casualToLuxury: 2,
      brightToDark: 2,
      simpleToDecorative: 2,
      modernToTraditional: 2
    }
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');
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

  const toggleSelection = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handlePreferenceChange = (key: keyof DesignPreferences, value: number) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (mode === 'cuisine' || mode === 'preferences') {
      handleComplete();
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (mode === 'cuisine' || mode === 'preferences') {
      onClose();
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (uploadedImage && selectedItems.length > 0) {
      onComplete(uploadedImage, selectedItems, preferences);
    }
  };

  const filteredGenres = FOOD_GENRES.filter(genre =>
    genre.toLowerCase().includes(genreSearchTerm.toLowerCase())
  );

  const filteredDishes = SPECIFIC_DISHES.filter(dish =>
    dish.toLowerCase().includes(dishSearchTerm.toLowerCase())
  );

  const canProceed = () => {
    if (mode === 'cuisine') return selectedItems.length > 0;
    if (mode === 'preferences') return true;
    switch (currentStep) {
      case 1: return uploadedImage !== null;
      case 2: return selectedItems.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const renderProgressBar = () => {
    if (mode === 'cuisine' || mode === 'preferences') {
      return null; // モード選択時はプログレスバーを表示しない
    }
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>元画像</span>
          <span>料理選択</span>
          <span>デザイン設定</span>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">元画像をアップロード</h3>
        <p className="text-gray-600">改装したい店舗の内装またはファサードの画像を1枚選択してください</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-purple-500 bg-purple-50'
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
              className="max-h-48 mx-auto rounded-lg"
            />
            <div className="text-sm text-green-600">✓ 画像がアップロードされました</div>
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
            <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">画像をドラッグ&ドロップ</p>
              <p className="text-gray-600 mb-4">または</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
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
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">料理ジャンル・料理名を選択</h3>
        <p className="text-gray-600">提供する料理やジャンルを選択してください（複数選択可能）</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-gray-800">料理ジャンル</h4>
            <input
              type="text"
              placeholder="ジャンルを検索..."
              value={genreSearchTerm}
              onChange={(e) => setGenreSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filteredGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleSelection(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedItems.includes(genre)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {filteredGenres.length === 0 && genreSearchTerm && (
            <p className="text-sm text-gray-500 text-center py-4">「{genreSearchTerm}」に該当するジャンルが見つかりません</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-gray-800">具体的な料理名</h4>
            <input
              type="text"
              placeholder="料理名を検索..."
              value={dishSearchTerm}
              onChange={(e) => setDishSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-gray-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filteredDishes.map((dish) => (
              <button
                key={dish}
                onClick={() => toggleSelection(dish)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedItems.includes(dish)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {dish}
              </button>
            ))}
          </div>
          {filteredDishes.length === 0 && dishSearchTerm && (
            <p className="text-sm text-gray-500 text-center py-4">「{dishSearchTerm}」に該当する料理が見つかりません</p>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">選択済み ({selectedItems.length}個)</h5>
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item) => (
                <span key={item} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {item}
                  <button
                    onClick={() => toggleSelection(item)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">デザイン指標を設定</h3>
        <p className="text-gray-600">理想的な店舗デザインの方向性を選択してください</p>
      </div>

      <div className="space-y-6">
        {[
          { key: 'casualToLuxury', label: 'スタイル', left: 'カジュアル', right: '高級' },
          { key: 'brightToDark', label: '明るさ', left: '明るい', right: '暗い' },
          { key: 'simpleToDecorative', label: '装飾度', left: 'シンプル', right: '装飾的' },
          { key: 'modernToTraditional', label: '時代感', left: 'モダン', right: 'トラディショナル' }
        ].map(({ key, label, left, right }) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">{label}</span>
              <span className="text-sm text-gray-600">
                {preferences[key as keyof DesignPreferences]}/4
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-20 text-right">{left}</span>
              <div className="flex-1 flex justify-center space-x-2">
                {[1, 2, 3, 4].map((value) => (
                  <button
                    key={value}
                    onClick={() => handlePreferenceChange(key as keyof DesignPreferences, value)}
                    className={`w-12 h-8 rounded-md border-2 transition-colors ${
                      preferences[key as keyof DesignPreferences] === value
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className={`w-full h-full rounded ${
                      preferences[key as keyof DesignPreferences] === value
                        ? 'bg-purple-500'
                        : ''
                    }`} />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600 w-20">{right}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🏪 レストランデザイン生成</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {renderProgressBar()}

          <div className="mb-8">
            {mode === 'cuisine' ? renderStep2() :
             mode === 'preferences' ? renderStep3() : (
              <>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={(mode === 'full' && currentStep === 1)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                (mode === 'full' && currentStep === 1)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {mode === 'cuisine' || mode === 'preferences' ? 'キャンセル' : '戻る'}
            </button>

            <button
              onClick={(mode === 'full' && currentStep === 3) || mode === 'cuisine' || mode === 'preferences' ? handleComplete : handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {mode === 'cuisine' ? '料理変更' :
               mode === 'preferences' ? '雰囲気変更' :
               currentStep === 3 ? '生成開始' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}