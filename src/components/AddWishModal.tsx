import React, { useState } from 'react';
import { Member, MemberId } from '../types';
import { CATEGORY_OPTIONS, DECO_ICONS } from '../services/storage';
import { X, Sparkles, Heart } from 'lucide-react';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentOperatorId: MemberId;
  onAddWish: (data: {
    title: string;
    note: string;
    categoryIcon: string;
    decoIcon: string;
    owners: string[];
    createdBy: string;
  }) => void;
}

export const AddWishModal: React.FC<AddWishModalProps> = ({
  isOpen,
  onClose,
  members,
  currentOperatorId,
  onAddWish,
}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('star');
  const [decoIcon, setDecoIcon] = useState('sprout');
  const [selectedOwners, setSelectedOwners] = useState<string[]>(['all']);

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
      setSelectedOwners(['all']);
    } else if (newOwners.length === members.length) {
      setSelectedOwners(['all']);
    } else {
      setSelectedOwners(newOwners);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddWish({
      title: title.trim(),
      note: note.trim(),
      categoryIcon,
      decoIcon,
      owners: selectedOwners,
      createdBy: currentOperatorId,
    });

    setTitle('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C3228]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl border border-[#E9DFCB] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E6D4] mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-lg font-bold text-[#3E342B]">许下一个新心愿</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9C8B79] hover:text-[#42382E] hover:bg-[#F2ECE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-1.5">
              心愿标题 <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：学会自由泳、去海边露营、拼完大地图..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DAC6] text-sm text-[#3E342B] placeholder-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#5B8EA6]/50 focus:border-[#5B8EA6] transition-all"
            />
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-1.5">
              心愿描述 / 为什么想做这个？
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下一两句温暖的初衷，日后回看会格外有意义..."
              className="w-full px-4 py-2 rounded-2xl bg-[#FAF6EE] border border-[#E5DAC6] text-sm text-[#3E342B] placeholder-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#5B8EA6]/50 focus:border-[#5B8EA6] transition-all resize-none"
            />
          </div>

          {/* Category Icon */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-2">
              心愿分类
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryIcon(cat.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-xs transition-all ${
                    categoryIcon === cat.id
                      ? 'bg-[#EBF3F7] border-[#5B8EA6] text-[#2F596D] font-bold shadow-xs'
                      : 'bg-[#FAF6EE] border-[#ECE1CF] text-[#786755] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <span className="text-sm mb-0.5">
                    {cat.id === 'star' && '✨'}
                    {cat.id === 'travel' && '🧭'}
                    {cat.id === 'study' && '📖'}
                    {cat.id === 'sport' && '🏆'}
                    {cat.id === 'family' && '❤️'}
                    {cat.id === 'hobby' && '🎨'}
                    {cat.id === 'food' && '🍳'}
                    {cat.id === 'outdoor' && '⛺'}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Natural Deco Element */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-1.5">
              便签微风点缀
            </label>
            <div className="flex items-center gap-2">
              {DECO_ICONS.map((deco) => (
                <button
                  type="button"
                  key={deco.id}
                  onClick={() => setDecoIcon(deco.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-all ${
                    decoIcon === deco.id
                      ? 'bg-amber-100/70 border-amber-300 text-[#7D5F18] font-bold'
                      : 'bg-[#FAF6EE] border-[#ECE1CF] text-[#7A6A58] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <span>{deco.symbol}</span>
                  <span>{deco.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Owners Multi-select */}
          <div>
            <label className="block text-xs font-bold text-[#5C4D3E] mb-2">
              心愿归属人（可多选）
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
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

          {/* Actions */}
          <div className="pt-3 border-t border-[#F0E6D4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#80705E] hover:bg-[#F3EBE0] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#4E8199] hover:bg-[#437187] active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              贴上许愿墙
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
