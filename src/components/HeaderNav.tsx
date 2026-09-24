import React, { useState } from 'react';
import { Trophy, Compass, Plus, Settings, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderNavProps {
  currentView: 'wish-wall' | 'completed-wall' | 'detail';
  setCurrentView: (view: 'wish-wall' | 'completed-wall') => void;
  completedCount: number;
  inProgressCount: number;
  onOpenAddWish: () => void;
  onOpenSettings: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  setCurrentView,
  completedCount,
  inProgressCount,
  onOpenAddWish,
  onOpenSettings,
}) => {
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  const handleToggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="relative z-30 w-full h-14 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#ECE3D2] transition-colors shrink-0">
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 flex-nowrap">
        {/* Left: App Title & Subtitle */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200/90 flex items-center justify-center text-lg shadow-xs shrink-0">
            🌱
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#42382E] truncate whitespace-nowrap">
                家庭心愿手帐
              </h1>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EFE8DA] text-[#6E6050] whitespace-nowrap">
                平等共享
              </span>
            </div>
            <p className="text-[10px] text-[#8A7968] hidden lg:block whitespace-nowrap">
              一家三口共同奔赴的大小心愿
            </p>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
          {/* Wall Switcher (Wish Wall vs Completed Wall) */}
          {currentView === 'completed-wall' ? (
            <button
              onClick={() => {
                sound.playTap();
                setCurrentView('wish-wall');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F0F3] hover:bg-[#DCE7EB] text-[#3D6677] border border-[#CCDCE2] text-xs font-medium transition-all shadow-xs whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">许愿墙</span>
              <span className="text-[11px] font-bold">({inProgressCount})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playTap();
                setCurrentView('completed-wall');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF5E4] hover:bg-[#F9ECCF] text-[#8C6B28] border border-[#ECD9A8] text-xs font-medium transition-all shadow-xs whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-[#D4A346] shrink-0" />
              <span className="hidden sm:inline">完成墙</span>
              <span className="text-[11px] font-bold">已实现 {completedCount}</span>
            </button>
          )}

          {/* Add Wish Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenAddWish();
            }}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-1 rounded-full bg-[#4E8199] hover:bg-[#447287] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span>许愿</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-full text-[#827464] hover:text-[#42382E] hover:bg-[#EFE8DA] transition-colors"
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A89885]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4E8199]" />
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="p-1.5 rounded-full text-[#827464] hover:text-[#42382E] hover:bg-[#EFE8DA] transition-colors"
            title="成员与数据设置"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
