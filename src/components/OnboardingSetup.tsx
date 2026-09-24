import React, { useState } from 'react';
import { Member, FamilyData } from '../types';
import { X, Sparkles, Check, RotateCcw } from 'lucide-react';
import { getInitialFamilyData } from '../services/storage';
import { sound } from '../utils/sound';

interface OnboardingSetupProps {
  isOpen: boolean;
  isInitial?: boolean;
  onClose: () => void;
  members: Member[];
  onSaveMembers: (updatedMembers: Member[]) => void;
  onResetSampleData?: () => void;
}

const AVATAR_OPTIONS = ['👦', '🧑', '🧒', '👨', '🧔', '👩', '👱‍♀️', '🌸', '🌱', '⭐', '🦁', '🐬'];

export const OnboardingSetup: React.FC<OnboardingSetupProps> = ({
  isOpen,
  isInitial = false,
  onClose,
  members,
  onSaveMembers,
  onResetSampleData,
}) => {
  const [localMembers, setLocalMembers] = useState<Member[]>(members);

  if (!isOpen) return null;

  const handleNameChange = (id: string, name: string) => {
    setLocalMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m))
    );
  };

  const handleAvatarChange = (id: string, avatar: string) => {
    sound.playPop();
    setLocalMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, avatar } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playStepChime();
    onSaveMembers(localMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C3228]/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl border border-[#E9DFCB] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D4] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <div>
              <h2 className="text-base font-bold text-[#3E342B]">
                {isInitial ? '欢迎使用家庭心愿手帐' : '家庭成员设置'}
              </h2>
              <p className="text-xs text-[#8A7968]">
                一家三口平等共建，定制你们温馨的昵称与头像
              </p>
            </div>
          </div>
          {!isInitial && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#9C8B79] hover:text-[#42382E] hover:bg-[#F2ECE0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {localMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl border bg-[#FAF7F0] space-y-2.5"
              style={{ borderColor: member.borderColor }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#554738]">
                  {member.role}
                </span>
                <span
                  className="w-3 h-3 rounded-full shadow-xs"
                  style={{ backgroundColor: member.colorTag }}
                  title="专属标识色"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Avatar Preview */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border shadow-xs bg-white shrink-0"
                  style={{ borderColor: member.borderColor }}
                >
                  {member.avatar}
                </div>

                {/* Nickname Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    value={member.name}
                    onChange={(e) => handleNameChange(member.id, e.target.value)}
                    placeholder={`请输入${member.role}昵称`}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DAC6] text-xs font-semibold text-[#3E342B] focus:outline-none focus:ring-2 focus:ring-[#5B8EA6]/40"
                  />
                </div>
              </div>

              {/* Avatar Picker Quick Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => handleAvatarChange(member.id, av)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center shrink-0 border transition-all ${
                      member.avatar === av
                        ? 'border-amber-400 bg-amber-50 scale-110 shadow-xs'
                        : 'border-[#EDE4D4] bg-white hover:bg-[#FAF4EB]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Reset Demo Data (Only in Settings view) */}
          {!isInitial && onResetSampleData && (
            <div className="pt-2 flex items-center justify-between text-xs text-[#8E7E6E] border-t border-[#F0E6D4]">
              <span>想要重新体验示例心愿？</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('确认恢复默认的家庭示例心愿吗？这将重置当前手帐数据。')) {
                    onResetSampleData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-[#9E6D38] hover:underline font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>恢复示例数据</span>
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 border-t border-[#F0E6D4] flex items-center justify-end gap-2">
            {!isInitial && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#80705E] hover:bg-[#F3EBE0]"
              >
                取消
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#4E8199] hover:bg-[#437187] active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isInitial ? '开启家庭心愿之旅' : '保存设置'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
