import React, { useState } from 'react';
import { Wish, Member, MemberId } from '../types';
import {
  ArrowLeft,
  Calendar,
  Footprints,
  Sparkles,
  Trophy,
  CheckCircle2,
  Plus,
  Heart,
  Quote,
  Clock,
  Compass,
  Smile,
  BadgeCheck,
} from 'lucide-react';
import { CATEGORY_OPTIONS, DECO_ICONS } from '../services/storage';
import { sound } from '../utils/sound';

interface WishDetailTimelineProps {
  wish: Wish;
  members: Member[];
  onBack: () => void;
  onOpenAddStep: () => void;
  onCompleteWish: () => void;
}

export const WishDetailTimeline: React.FC<WishDetailTimelineProps> = ({
  wish,
  members,
  onBack,
  onOpenAddStep,
  onCompleteWish,
}) => {
  const isCompleted = wish.status === '已完成';
  const steps = wish.progressSteps || [];

  // Helper to get member by ID
  const getMember = (id: string) => members.find((m) => m.id === id);

  // Format creation date
  const formatWishDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
    } catch {
      return isoStr;
    }
  };

  // Calculate days spent
  const calculateDaysSpent = () => {
    if (!wish.createdAt) return 1;
    const start = new Date(wish.createdAt).getTime();
    const end = wish.completedAt ? new Date(wish.completedAt).getTime() : Date.now();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  // Calculate family participation stats
  const calculateParticipation = () => {
    const counts: Record<string, number> = {
      son: 0,
      dad: 0,
      mom: 0,
    };

    steps.forEach((step) => {
      if (step.by.includes('all')) {
        counts.son += 1;
        counts.dad += 1;
        counts.mom += 1;
      } else {
        step.by.forEach((id) => {
          if (counts[id] !== undefined) {
            counts[id] += 1;
          }
        });
      }
    });

    return counts;
  };

  const stats = calculateParticipation();
  const daysSpent = calculateDaysSpent();

  // Deco symbol
  const decoItem = DECO_ICONS.find((d) => d.id === wish.decoIcon);
  const decoSymbol = decoItem ? decoItem.symbol : '🌱';

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-24 text-[#4A4036]">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#ECE2D0] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2ECE0] hover:bg-[#E9DFD0] text-xs font-semibold text-[#5A4D3E] transition-all active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回{isCompleted ? '完成墙' : '许愿墙'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-[#7D6E5D]">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[#8C6920] bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-[#D4A346]" />
                已圆满达成
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-[#E8F0F3] text-[#3D6677] border border-[#CCDCE2] px-2.5 py-0.5 rounded-full">
                <Footprints className="w-3.5 h-3.5 text-[#5B8EA6]" />
                已迈出 {steps.length} 步
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Wish Hero Card */}
        <div
          className={`relative p-5 sm:p-7 rounded-3xl border shadow-sm transition-all mb-6 ${
            isCompleted
              ? 'bg-[#FFFDF7] border-[#EBD6A2] completed-postit-card'
              : 'bg-[#FFFDF9] border-[#E9DFCB] postit-card'
          }`}
        >
          {/* Top Tape */}
          <div className="washi-tape" />

          {/* Badge & Deco */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{decoSymbol}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5EFE3] text-[#6B5B49] border border-[#E8DEC9]">
                家庭心愿手帐
              </span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-[#8C6920]">
                <BadgeCheck className="w-4 h-4 text-[#D4A346]" />
                <span>圆满实现</span>
              </div>
            )}
          </div>

          {/* Wish Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3E342B] tracking-tight mb-2">
            {wish.title}
          </h1>

          {/* Wish Note / Reason */}
          {wish.note && (
            <p className="text-sm text-[#6C5D4E] leading-relaxed mb-4 bg-[#FAF6EE] p-3 rounded-2xl border border-[#EDE4D2]">
              “{wish.note}”
            </p>
          )}

          {/* Wish Meta: Owners & Created At */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F2EADA] text-xs text-[#7F705F]">
            <div className="flex items-center gap-2">
              <span className="text-[#968674]">心愿归属：</span>
              <div className="flex items-center -space-x-1.5">
                {wish.owners.includes('all') ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF3F7] border border-[#BFD8E3] text-[#3F6B7E] font-medium">
                    <span>👨‍👩‍👦 全家一起</span>
                  </div>
                ) : (
                  wish.owners.map((ownerId) => {
                    const m = getMember(ownerId);
                    if (!m) return null;
                    return (
                      <div
                        key={ownerId}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFDF9] border shadow-xs"
                        style={{ borderColor: m.borderColor }}
                        title={`${m.name} (${m.role})`}
                      >
                        <span>{m.avatar}</span>
                        <span className="text-[#4E4134] font-medium">{m.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#968674]">
              <Calendar className="w-3.5 h-3.5" />
              <span>许愿于 {formatWishDate(wish.createdAt)}</span>
            </div>
          </div>

          {/* Completed Extra Information Block */}
          {isCompleted && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-[#7B5F1F] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                <span className="flex items-center gap-1 text-[#8C6920]">
                  <Trophy className="w-4 h-4 text-[#D4A346]" />
                  从许愿到达成历经 {daysSpent} 天，共迈出了 {steps.length} 步！
                </span>
                {wish.completedAt && (
                  <span className="text-[#A08139]">
                    实现日期：{formatWishDate(wish.completedAt)}
                  </span>
                )}
              </div>

              {/* Family Effort Summary (Warm, no ranking, pure togetherness) */}
              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-3">
                <span className="text-[#8C6E2D]">全家共同印记：</span>
                <span className="px-2 py-0.5 rounded-md bg-white/70 border border-amber-200/80">
                  👨 爸爸参与了 <strong>{stats.dad}</strong> 次
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/70 border border-amber-200/80">
                  👦 儿子参与了 <strong>{stats.son}</strong> 次
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/70 border border-amber-200/80">
                  👩 妈妈参与了 <strong>{stats.mom}</strong> 次
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Glowing Progress Belt / Milestone Path */}
        <div className="sticky top-[53px] z-20 py-2.5 px-4 mb-8 bg-[#FAF7F0]/95 backdrop-blur-md rounded-2xl border border-[#ECE2CF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#665747] mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A346]" />
              <span>渐进成长之路</span>
            </div>
            <span className="text-[11px] text-[#8C7A68]">
              {isCompleted ? '心愿已照进现实！🎉' : `每努力一步就更靠近一点（已迈出 ${steps.length} 步）`}
            </span>
          </div>

          {/* Stepping Path Visual */}
          <div className="relative w-full h-3 bg-[#EAE2D2] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted
                  ? 'w-full bg-linear-to-r from-amber-300 via-amber-400 to-yellow-400 shadow-sm'
                  : 'bg-linear-to-r from-[#7BA9BC] via-[#5B8EA6] to-[#4E8199]'
              }`}
              style={{
                width: isCompleted
                  ? '100%'
                  : `${Math.min(95, Math.max(15, steps.length * 20))}%`,
              }}
            />
          </div>
        </div>

        {/* Vertical Timeline Section */}
        <div className="relative pl-6 sm:pl-8">
          {/* Vertical Spine Line */}
          <div className="absolute left-2.5 sm:left-3.5 top-0 bottom-6 w-0.5 bg-[#DFD5C2]" />

          {/* Empty Steps Note */}
          {steps.length === 0 && (
            <div className="p-8 text-center bg-[#FFFDF9] rounded-2xl border border-[#E8DFC9] postit-card mb-8">
              <p className="text-sm text-[#7D6F5E] mb-3">
                还没有记录任何进展呢！哪怕只是买了一件小道具、查了一个攻略，都算值得被记住的新一步哦！
              </p>
              {!isCompleted && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenAddStep();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4E8199] hover:bg-[#447287] text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>记录第一步</span>
                </button>
              )}
            </div>
          )}

          {/* Steps Timeline Notes */}
          <div className="space-y-6">
            {steps.map((step, idx) => {
              // Rotation angle for playful post-it authenticity
              const rotateDeg = (idx % 2 === 0 ? -0.8 : 0.8) + (idx % 3) * 0.2;

              // Step participant members
              const stepMembers = step.by.includes('all')
                ? members
                : step.by.map((id) => getMember(id)).filter(Boolean) as Member[];

              const primaryColor =
                stepMembers[0]?.colorTag || '#5B8EA6';

              return (
                <div key={step.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className="absolute -left-[23px] sm:-left-[27px] top-6 w-5 h-5 rounded-full bg-[#FAF7F0] border-2 shadow-xs flex items-center justify-center z-10"
                    style={{ borderColor: primaryColor }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>

                  {/* Sticky Post-it Card */}
                  <div
                    style={{
                      transform: `rotate(${rotateDeg}deg)`,
                    }}
                    className="relative p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DFCB] postit-card transition-transform duration-200 hover:rotate-0"
                  >
                    {/* Washi tape header */}
                    <div className="washi-tape" />

                    {/* Step Header: Date + Who did this */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#8C7A68] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#A59582]" />
                        <span>{step.date}</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-[#F2EBDE] text-[10px] text-[#786755]">
                          第 {idx + 1} 步
                        </span>
                      </div>

                      {/* Participant Avatars */}
                      <div className="flex items-center gap-1.5">
                        {step.by.includes('all') ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#E8F0F3] text-[#3D6677] font-medium border border-[#CCDCE2]">
                            👨‍👩‍👦 全家一起
                          </span>
                        ) : (
                          stepMembers.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: m.lightColor,
                                borderColor: m.borderColor,
                                color: m.colorTag,
                              }}
                            >
                              <span>{m.avatar}</span>
                              <span>{m.name}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* 1. AI Mood Phrase (心情一句话) */}
                    {step.moodText && (
                      <div className="mb-3 flex items-start gap-2 p-2.5 rounded-xl bg-[#F8F3EA] border border-[#ECE0CE] text-xs text-[#6B5A47]">
                        <span className="text-sm mt-0.5">💭</span>
                        <div className="italic leading-relaxed font-medium">
                          “{step.moodText}”
                        </div>
                      </div>
                    )}

                    {/* 2. What was done: User entered content (这一步做了什么) */}
                    <div className="mb-3 text-sm sm:text-base font-bold text-[#3E342B] leading-relaxed pl-1">
                      {step.content}
                    </div>

                    {/* 3. AI Encouragement (鼓励语 - 手写温情体) */}
                    {step.encouragement && (
                      <div className="pt-2 border-t border-[#F2E9D8] flex items-start gap-2 text-xs text-[#806B36]">
                        <Quote className="w-3.5 h-3.5 text-[#D4A346] shrink-0 mt-0.5" />
                        <span className="font-handwriting text-sm leading-relaxed text-[#755D28]">
                          {step.encouragement}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar - Optimized for mobile: Never awkward wrap */}
        <div className="mt-10 pt-6 border-t border-[#ECE2D0]">
          {!isCompleted ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3.5">
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenAddStep();
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#4E8199] hover:bg-[#437187] active:scale-98 text-white text-sm font-bold shadow-md transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>记录新的一步</span>
              </button>

              <button
                onClick={() => {
                  sound.playCelebration();
                  onCompleteWish();
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-98 text-[#3A2800] text-sm font-extrabold shadow-md transition-all whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#3A2800] shrink-0" />
                <span className="whitespace-nowrap">这个心愿实现啦！🎉</span>
              </button>
            </div>
          ) : (
            <div className="w-full text-center py-3 bg-[#FFFDF7] rounded-2xl border border-[#E8D49E] text-xs text-[#8C6920] font-medium">
              ✨ 这个心愿已在家庭完成墙中永久珍藏，随时可以回来翻阅这段珍贵的奋斗时光！
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
