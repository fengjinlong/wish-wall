import React, { useState } from 'react';
import { Member, MemberId } from '../types';
import { Trophy, Compass, Plus, Users, Settings, Sparkles } from 'lucide-react';

interface HeaderNavProps {
  currentView: 'wish-wall' | 'completed-wall' | 'detail';
  setCurrentView: (view: 'wish-wall' | 'completed-wall') => void;
  members: Member[];
  currentOperatorId: MemberId;
  setCurrentOperatorId: (id: MemberId) => void;
  completedCount: number;
  inProgressCount: number;
  onOpenAddWish: () => void;
  onOpenSettings: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  setCurrentView,
  members,
  currentOperatorId,
  setCurrentOperatorId,
  completedCount,
  inProgressCount,
  onOpenAddWish,
  onOpenSettings,
}) => {
  const [showMemberSwitch, setShowMemberSwitch] = useState(false);
  const currentOperator = members.find((m) => m.id === currentOperatorId) || members[0];

  return (
    <header className="relative z-30 w-full px-4 sm:px-6 py-3 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#ECE3D2] transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100/80 border border-amber-200/80 flex items-center justify-center text-xl shadow-xs">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#42382E]">
                家庭心愿手帐
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EFE8DA] text-[#6E6050]">
                平等共享 · 温馨记录
              </span>
            </div>
            <p className="text-xs text-[#8A7968] hidden xs:block">
              一家三口共同奔赴的大小心愿
            </p>
          </div>
        </div>

        {/* Center/Right: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Operator Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowMemberSwitch(!showMemberSwitch)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F3ECE0] hover:bg-[#EBE2D4] border border-[#DFD5C4] transition-all text-xs text-[#524538] font-medium shadow-xs"
              title="切换当前记录人"
            >
              <span className="text-base leading-none">{currentOperator.avatar}</span>
              <span className="max-w-[70px] truncate">{currentOperator.name}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentOperator.colorTag }}
              />
            </button>

            {/* Dropdown Menu */}
            {showMemberSwitch && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMemberSwitch(false)}
                />
                <div className="absolute right-0 mt-2 w-52 p-2 bg-[#FFFDF9] rounded-2xl shadow-xl border border-[#E8DFC9] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-xs text-[#827464] border-b border-[#F0E8D7] mb-1 font-medium flex items-center justify-between">
                    <span>当前是谁在写手帐？</span>
                    <Users className="w-3.5 h-3.5 text-[#A59582]" />
                  </div>
                  <div className="space-y-1">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setCurrentOperatorId(m.id);
                          setShowMemberSwitch(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          m.id === currentOperatorId
                            ? 'bg-[#F2ECE1] text-[#3E342B] font-semibold'
                            : 'hover:bg-[#FAF4EB] text-[#615344]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.avatar}</span>
                          <div className="text-left">
                            <p>{m.name}</p>
                            <p className="text-[10px] text-[#918170]">{m.role}</p>
                          </div>
                        </div>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.colorTag }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Wall Switcher (Wish Wall vs Completed Wall) */}
          {currentView === 'completed-wall' ? (
            <button
              onClick={() => setCurrentView('wish-wall')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F0F3] hover:bg-[#DCE7EB] text-[#3D6677] border border-[#CCDCE2] text-xs font-medium transition-all shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>许愿墙 ({inProgressCount})</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('completed-wall')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF5E4] hover:bg-[#F9ECCF] text-[#8C6B28] border border-[#ECD9A8] text-xs font-medium transition-all shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-[#D4A346]" />
              <span className="hidden xs:inline">完成墙</span>
              <span>已实现 {completedCount}</span>
            </button>
          )}

          {/* Add Wish Button */}
          <button
            onClick={onOpenAddWish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4E8199] hover:bg-[#447287] active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>许愿</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full text-[#827464] hover:text-[#42382E] hover:bg-[#EFE8DA] transition-colors"
            title="成员与数据设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
