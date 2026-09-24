import React, { useEffect } from 'react';
import { Wish, Member } from '../types';
import { fireConfetti } from '../utils/confetti';
import { Trophy, Sparkles, ArrowRight, Heart } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  wish: Wish;
  members: Member[];
  onGoToCompletedWall: () => void;
  onStayHere: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  wish,
  members,
  onGoToCompletedWall,
  onStayHere,
}) => {
  useEffect(() => {
    if (isOpen) {
      fireConfetti(2800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stepCount = wish.progressSteps?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30261D]/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border-2 border-[#EED7A1] shadow-2xl p-6 sm:p-8 text-center completed-postit-card animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Washi Tape */}
        <div className="washi-tape" />

        {/* Top Trophy Icon */}
        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-200 to-amber-100 border-2 border-[#DFC484] flex items-center justify-center text-3xl mx-auto mb-4 shadow-md animate-bounce">
          🏆
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-xs font-bold text-[#8C6920] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A346]" />
          <span>恭喜！心愿圆满达成！</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#423525] mb-2 leading-tight">
          “{wish.title}”
        </h2>

        <p className="text-sm font-semibold text-[#8C6F2A] mb-5">
          经过全家人 <strong>{stepCount}</strong> 次用心付出，这个心愿终于开花结果啦！🎉
        </p>

        {/* Warm message box */}
        <div className="p-4 rounded-2xl bg-[#FBF5E6] border border-[#E9D9B2] text-xs text-[#705929] leading-relaxed mb-6 font-medium text-left">
          <p className="mb-2">
            每一个看似微小的脚步，都在全家人的相互陪伴下变成了闪闪发光的现实。
          </p>
          <p className="text-[#967425]">
            这个心愿现已正式搬入<strong>【荣誉完成墙】</strong>，成为家庭成长时光里永恒珍藏的一页！
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onStayHere}
            className="w-full sm:w-1/2 py-2.5 rounded-2xl border border-[#DFD4C0] text-xs font-semibold text-[#736351] hover:bg-[#F4ECE0] transition-colors"
          >
            留在时间线回看
          </button>
          <button
            onClick={onGoToCompletedWall}
            className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#D4A346] hover:bg-[#C49439] active:scale-95 text-white text-xs font-bold shadow-md transition-all"
          >
            <span>进入完成墙</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
