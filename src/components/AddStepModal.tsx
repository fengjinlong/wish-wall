import React, { useState } from 'react';
import { Wish, Member, MemberId } from '../types';
import { generateStepMoodAndEncouragement } from '../services/gemini';
import { X, Sparkles, Loader2, Quote, RefreshCw } from 'lucide-react';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  wish: Wish;
  members: Member[];
  currentOperatorId: MemberId;
  onSaveStep: (step: {
    by: string[];
    content: string;
    moodText: string;
    encouragement: string;
  }) => void;
}

export const AddStepModal: React.FC<AddStepModalProps> = ({
  isOpen,
  onClose,
  wish,
  members,
  currentOperatorId,
  onSaveStep,
}) => {
  const [content, setContent] = useState('');
  const [selectedOwners, setSelectedOwners] = useState<string[]>([currentOperatorId]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMood, setPreviewMood] = useState<string | null>(null);
  const [previewEncourage, setPreviewEncourage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleOwner = (id: string) => {
    if (id === 'all') {
      setSelectedOwners(['all']);
      return;
    }

    let newOwners = selectedOwners.filter((o) => o !== 'all');
    if (newOwners.includes(id)) {
      newOwners = newOwners.filter((o) => o !== id);
    } else {
      newOwners.push(id);
    }

    if (newOwners.length === 0) {
      setSelectedOwners([currentOperatorId]);
    } else {
      setSelectedOwners(newOwners);
    }
  };

  const handleGenerateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const stepNumber = (wish.progressSteps?.length || 0) + 1;
      const ownerNames = selectedOwners.includes('all')
        ? ['全家一起']
        : selectedOwners
            .map((id) => members.find((m) => m.id === id)?.name || id);

      const previousMoods = (wish.progressSteps || []).map((s) => s.moodText).filter(Boolean);
      const previousEncouragements = (wish.progressSteps || []).map((s) => s.encouragement).filter(Boolean);

      const result = await generateStepMoodAndEncouragement({
        wishTitle: wish.title,
        wishNote: wish.note,
        stepNumber,
        stepContent: content.trim(),
        stepOwners: ownerNames,
        previousMoods,
        previousEncouragements,
      });

      // Save step permanently to wish
      onSaveStep({
        by: selectedOwners,
        content: content.trim(),
        moodText: result.moodText,
        encouragement: result.encouragement,
      });

      setContent('');
      onClose();
    } catch (err) {
      console.error('Error generating step:', err);
      // Fallback
      onSaveStep({
        by: selectedOwners,
        content: content.trim(),
        moodText: '今天这一步超棒，心愿又近了一点！',
        encouragement: '只要全家人一起向前，小愿望就会慢慢开花结果！',
      });
      setContent('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C3228]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#E9DFCB] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D4] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👣</span>
            <div>
              <h2 className="text-base font-bold text-[#3E342B]">记录新的一步</h2>
              <p className="text-xs text-[#8A7968] truncate max-w-[240px]">
                {wish.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full text-[#9C8B79] hover:text-[#42382E] hover:bg-[#F2ECE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerateAndSave} className="space-y-4">
          {/* What was done (用户唯一需要填写的核心内容) */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-1.5">
              这一次为心愿做了什么？ <span className="text-amber-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={content}
              disabled={isLoading}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例如：去体育馆咨询了课程、买好了登山杖、完成了第一次换气练习..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DAC6] text-sm text-[#3E342B] placeholder-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#5B8EA6]/50 focus:border-[#5B8EA6] transition-all resize-none"
            />
            <p className="text-[11px] text-[#9A8A77] mt-1">
              ✨ 日期、心情一句话和鼓励语将由系统与 Gemini 自动为你匹配生成。
            </p>
          </div>

          {/* Who did this step */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-1.5">
              这一步是谁做的？（可多选）
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleToggleOwner('all')}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  selectedOwners.includes('all')
                    ? 'bg-[#EBF3F7] border-[#5B8EA6] text-[#2F596D] shadow-xs'
                    : 'bg-[#FAF6EE] border-[#ECE1CF] text-[#7A6A58]'
                }`}
              >
                👨‍👩‍👦 全家一起
              </button>

              {members.map((m) => {
                const isSelected =
                  selectedOwners.includes('all') || selectedOwners.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    disabled={isLoading}
                    onClick={() => handleToggleOwner(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      isSelected && !selectedOwners.includes('all')
                        ? 'border-2 font-bold shadow-xs'
                        : 'bg-[#FAF6EE] border-[#ECE1CF] text-[#7A6A58]'
                    }`}
                    style={
                      isSelected && !selectedOwners.includes('all')
                        ? {
                            backgroundColor: m.lightColor,
                            borderColor: m.borderColor,
                            color: m.colorTag,
                          }
                        : {}
                    }
                  >
                    <span>{m.avatar}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Animation Box */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-[#F7F2E6] border border-[#E8DEC9] flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4 animate-spin text-[#D4A346]" />
              </div>
              <div className="text-xs text-[#6B5A47]">
                <p className="font-bold">正在为你准备一句悄悄话… 🌱</p>
                <p className="text-[11px] text-[#93826F]">Gemini 正在细细品味你们这份温暖的努力</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#F0E6D4] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#80705E] hover:bg-[#F3EBE0] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#4E8199] hover:bg-[#437187] active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>记录并生成悄悄话</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
