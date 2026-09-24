import React from 'react';
import { Wish } from '../types';
import { DECO_ICONS } from '../services/storage';
import {
  Sparkles,
  Compass,
  BookOpen,
  Trophy,
  Heart,
  Palette,
  UtensilsCrossed,
  Tent,
  CheckCircle2,
  Footprints,
} from 'lucide-react';

interface WishCard3DProps {
  wish: Wish;
  isCompleted?: boolean;
  onClick: () => void;
  isSelected?: boolean;
}

export const WishCard3D: React.FC<WishCard3DProps> = ({
  wish,
  isCompleted = false,
  onClick,
  isSelected = false,
}) => {
  // Category icon mapping
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'travel':
        return <Compass className="w-4 h-4 text-[#5B8EA6]" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-[#6A8E6A]" />;
      case 'sport':
        return <Trophy className="w-4 h-4 text-[#C77959]" />;
      case 'family':
        return <Heart className="w-4 h-4 text-[#8C7B65]" />;
      case 'hobby':
        return <Palette className="w-4 h-4 text-[#A07E9B]" />;
      case 'food':
        return <UtensilsCrossed className="w-4 h-4 text-[#C88D4B]" />;
      case 'outdoor':
        return <Tent className="w-4 h-4 text-[#588B76]" />;
      case 'star':
      default:
        return <Sparkles className="w-4 h-4 text-[#D4A346]" />;
    }
  };

  const getDecoSymbol = (id: string) => {
    const item = DECO_ICONS.find((d) => d.id === id);
    return item ? item.symbol : '🌱';
  };

  const stepCount = wish.progressSteps?.length || 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative w-44 sm:w-48 p-3.5 rounded-2xl cursor-pointer select-none transform-gpu backface-hidden ${
        isCompleted
          ? 'bg-[#FFFDF6] border-2 border-[#EAD5A0] completed-postit-card'
          : 'bg-[#FFFDF8] border border-[#E9DFCB] postit-card'
      } ${
        isSelected
          ? 'ring-4 ring-amber-400/70 shadow-2xl scale-110 z-50 transition-transform duration-200'
          : 'hover:scale-105 active:scale-95 transition-transform duration-150'
      }`}
    >
      {/* Decorative Washi Tape on top */}
      <div className="washi-tape" />

      {/* Top row: Category icon + Decorative Natural element */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-xl bg-[#F7F2E7] border border-[#E8DEC9] flex items-center justify-center shadow-xs">
          {getCategoryIcon(wish.categoryIcon)}
        </div>
        <div className="flex items-center gap-1 text-sm opacity-80" title="自然微风点缀">
          <span>{getDecoSymbol(wish.decoIcon)}</span>
          {isCompleted && <span className="text-xs">✨</span>}
        </div>
      </div>

      {/* Wish Title */}
      <h3 className="text-sm font-bold text-[#3E342B] line-clamp-2 leading-snug mb-3">
        {wish.title}
      </h3>

      {/* Progress & Milestone Indicator */}
      <div className="pt-2 border-t border-[#F2EADB] flex items-center justify-between text-[11px] text-[#786957]">
        {isCompleted ? (
          <div className="flex items-center gap-1 text-[#967425] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A346]" />
            <span>已达成愿望</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-medium">
            <Footprints className="w-3.5 h-3.5 text-[#5B8EA6]" />
            <span>
              已迈出 <strong className="text-[#3E342A]">{stepCount}</strong> 步
            </span>
          </div>
        )}

        {/* Small step dots visualization */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(stepCount + (isCompleted ? 0 : 1), 5) }).map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${
                isCompleted
                  ? 'bg-amber-400'
                  : idx < stepCount
                  ? 'bg-[#5B8EA6]'
                  : 'bg-[#E5DAC6]'
              }`}
            />
          ))}
          {stepCount > 4 && <span className="text-[9px] text-[#A59582]">+</span>}
        </div>
      </div>

      {/* Honor Stamp Badge for Completed Wall */}
      {isCompleted && (
        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#FAF0D4] border border-[#DFC484] text-[10px] text-[#8C6920] font-bold shadow-xs rotate-[-6deg]">
          ★ 荣誉心愿
        </div>
      )}
    </div>
  );
};
