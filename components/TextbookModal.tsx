'use client'

import { useState, useEffect } from 'react';
import { getChapterData, TextbookItem, TextbookChapter } from '@/lib/textbook-data';

interface TextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedItems: TextbookItem[]) => void;
  initialSelectedIds?: string[];
}

export default function TextbookModal({
  isOpen,
  onClose,
  onComplete,
  initialSelectedIds = []
}: TextbookModalProps) {
  const [chapters] = useState<TextbookChapter[]>(getChapterData());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleChapter = (chapterNumber: number) => {
    const chapter = chapters.find(c => c.number === chapterNumber);
    if (!chapter) return;

    const chapterItemIds = chapter.items.map(item => item.id);
    const allSelected = chapterItemIds.every(id => selectedIds.has(id));

    const newSelected = new Set(selectedIds);
    if (allSelected) {
      chapterItemIds.forEach(id => newSelected.delete(id));
    } else {
      chapterItemIds.forEach(id => newSelected.add(id));
    }
    setSelectedIds(newSelected);
  };

  const toggleAllItems = () => {
    const allItemIds = chapters.flatMap(chapter => chapter.items.map(item => item.id));
    const allSelected = allItemIds.every(id => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allItemIds));
    }
  };

  const toggleChapterExpansion = (chapterNumber: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNumber)) {
      newExpanded.delete(chapterNumber);
    } else {
      newExpanded.add(chapterNumber);
    }
    setExpandedChapters(newExpanded);
  };

  const getSelectedItems = (): TextbookItem[] => {
    return chapters.flatMap(chapter =>
      chapter.items.filter(item => selectedIds.has(item.id))
    );
  };

  const handleComplete = () => {
    const selectedItems = getSelectedItems();
    onComplete(selectedItems);
    onClose();
  };

  const selectedCount = selectedIds.size;
  const totalCount = chapters.reduce((sum, chapter) => sum + chapter.items.length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📖 &SPICE 教科書</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selection Stats and Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                選択中: <span className="font-medium text-blue-600">{selectedCount}</span> / {totalCount} 項目
              </div>
              <button
                onClick={toggleAllItems}
                className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {selectedCount === totalCount ? '全て解除' : '全て選択'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {chapters.map((chapter) => {
                const chapterSelected = chapter.items.filter(item => selectedIds.has(item.id)).length;
                const chapterTotal = chapter.items.length;
                const isExpanded = expandedChapters.has(chapter.number);

                return (
                  <div key={chapter.number} className="border border-gray-200 rounded-lg">
                    {/* Chapter Header */}
                    <div className="bg-gray-50 p-4 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleChapterExpansion(chapter.number)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <h3 className="text-lg font-semibold text-gray-800">
                            第{chapter.number}章 {chapter.title}
                          </h3>
                          <span className="text-sm text-gray-600">
                            ({chapterSelected}/{chapterTotal})
                          </span>
                        </div>
                        <button
                          onClick={() => toggleChapter(chapter.number)}
                          className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          {chapterSelected === chapterTotal ? '章解除' : '章選択'}
                        </button>
                      </div>
                    </div>

                    {/* Chapter Items */}
                    {isExpanded && (
                      <div className="p-4 space-y-3">
                        {chapter.items.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleItem(item.id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={item.id} className="flex-1 cursor-pointer">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                {item.id}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.title}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                選択項目は「規定通りにしたがってほしい」としてプロンプトに追加されます
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  適用 ({selectedCount}項目)
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}