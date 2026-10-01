import React, { useState, useEffect, useRef } from 'react';
import { Wish, Member } from '../types';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Sun,
  Sunset,
  Moon,
  Camera,
  Trash2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import {
  WishCardTone,
  WishCardLayout,
  PhotoTemplate,
  WishCardPreference,
  PHOTO_TEMPLATES,
  compressImageToJpeg,
  generateWishCardTheme,
  loadWishCardPreference,
  saveWishCardPreference,
} from '../utils/wishCardTheme';

interface WishCardExportModalProps {
  isOpen: boolean;
  wish: Wish;
  members: Member[];
  allWishes?: Wish[];
  onClose: () => void;
}

export const WishCardExportModal: React.FC<WishCardExportModalProps> = ({
  isOpen,
  wish,
  members,
  allWishes = [],
  onClose,
}) => {
  // Load initial preferences from localStorage
  const [pref, setPref] = useState<WishCardPreference>(() =>
    loadWishCardPreference(wish.id)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccessTip, setSaveSuccessTip] = useState(false);
  const [shareTip, setShareTip] = useState<string | null>(null);
  const [photoTip, setPhotoTip] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preference whenever wish changes
  useEffect(() => {
    if (isOpen) {
      const saved = loadWishCardPreference(wish.id);
      setPref(saved);
      setSaveSuccessTip(false);
      setShareTip(null);
      setPhotoTip(null);
    }
  }, [isOpen, wish.id]);

  // Persist preference to localStorage on update
  const updatePreference = (partial: Partial<WishCardPreference>) => {
    setPref((prev) => {
      const next = { ...prev, ...partial };
      saveWishCardPreference(wish.id, next);
      return next;
    });
  };

  if (!isOpen) return null;

  const isPhotoMode = Boolean(pref.photoUrl);
  const photoConfig = PHOTO_TEMPLATES[pref.photoTemplate || 'light'];

  // 1. Generate procedural theme & background (used directly or as color base in photo mode)
  const theme = generateWishCardTheme(wish.categoryIcon, pref.tone, pref.seed);

  // 2. Date span formatting (格式: 起始日期 → 完成日期)
  const formatShortDate = (isoStr?: string | null) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
    } catch {
      return isoStr || '';
    }
  };

  const startDate = formatShortDate(wish.createdAt);
  const endDate = formatShortDate(wish.completedAt || wish.createdAt);
  const dateSpanText = `${startDate} → ${endDate}`;

  // 3. Last encouragement quote (全卡唯一正文文字)
  const getLastEncouragement = () => {
    const steps = wish.progressSteps || [];
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].encouragement?.trim()) {
        return steps[i].encouragement.trim();
      }
    }
    if (wish.completionNote?.trim()) {
      return wish.completionNote.trim();
    }
    return '愿望开花的那一刻，照亮的是我们全家人一起走过的每一步。';
  };

  const featuredEncouragement = getLastEncouragement();

  // 4. Participating members color badges
  const participatingMembers: Array<{ member: Member; abbr: string }> = [];
  const isAll = wish.owners.includes('all');

  members.forEach((m) => {
    const isOwner = isAll || wish.owners.includes(m.id);
    if (isOwner) {
      let abbr = m.name.slice(0, 1);
      if (m.id === 'son' || m.role.includes('儿') || m.role.includes('子')) abbr = '子';
      else if (m.id === 'dad' || m.role.includes('爸')) abbr = '爸';
      else if (m.id === 'mom' || m.role.includes('妈')) abbr = '妈';

      participatingMembers.push({ member: m, abbr });
    }
  });

  // 5. Watermark: "我们家的心愿 · 第 X 枚"
  const completedList = (allWishes.length > 0 ? allWishes : [wish]).filter(
    (w) => w.status === '已完成'
  );
  const sortedCompleted = [...completedList].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return tA - tB;
  });
  const completedIdx = sortedCompleted.findIndex((w) => w.id === wish.id);
  const badgeIndex = completedIdx >= 0 ? completedIdx + 1 : 1;
  const brandWatermark = `我们家的心愿 · 第 ${badgeIndex} 枚`;

  // 6. Journey path calculations & step compression
  const actualStepsCount = wish.progressSteps?.length || 0;
  const isFewSteps = actualStepsCount <= 6;

  // Compression numbers for Case B
  const compressedTotal = Math.max(0, actualStepsCount - 3);
  const n1 = Math.round(compressedTotal / 2);
  const n2 = compressedTotal - n1;

  // Switch style: if in photo mode, cycle through the 3 preset photo templates; otherwise randomize procedural seed
  const handleRandomizeStyle = () => {
    sound.playTap();
    if (isPhotoMode) {
      const order: PhotoTemplate[] = ['light', 'serene', 'warm_vintage'];
      const curIdx = order.indexOf(pref.photoTemplate || 'light');
      const nextTemplate = order[(curIdx + 1) % order.length];
      updatePreference({ photoTemplate: nextTemplate });
      setPhotoTip(`已切换至：${PHOTO_TEMPLATES[nextTemplate].label}（${PHOTO_TEMPLATES[nextTemplate].description}）`);
      setTimeout(() => setPhotoTip(null), 3000);
      return;
    }
    const newSeed = Math.floor(Math.random() * 1000000) + 1;
    updatePreference({ seed: newSeed });
  };

  // Switch color tone (Procedural mode)
  const handleSelectTone = (tone: WishCardTone) => {
    sound.playTap();
    updatePreference({ tone });
  };

  // Switch photo template (Photo mode)
  const handleSelectPhotoTemplate = (tmpl: PhotoTemplate) => {
    sound.playTap();
    updatePreference({ photoTemplate: tmpl });
    setPhotoTip(`已切换至：${PHOTO_TEMPLATES[tmpl].label}（${PHOTO_TEMPLATES[tmpl].description}）`);
    setTimeout(() => setPhotoTip(null), 3000);
  };

  // Switch layout
  const handleSelectLayout = (layout: WishCardLayout) => {
    sound.playTap();
    updatePreference({ layout });
  };

  // Photo Upload Handler
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      sound.playTap();
      const compressed = await compressImageToJpeg(file, 1000, 0.72);
      updatePreference({
        photoUrl: compressed,
        photoTemplate: pref.photoTemplate || 'light',
      });
      setPhotoTip('📷 照片背景已开启！已自动进行氛围虚化与色调调优。');
      setTimeout(() => setPhotoTip(null), 3500);
    } catch (err) {
      console.error('Failed to compress and set photo:', err);
      alert('读取图片失败，请尝试其他照片');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    sound.playTap();
    updatePreference({ photoUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhotoTip('已移除照片，退回参数化程序生成背景模式。');
    setTimeout(() => setPhotoTip(null), 3000);
  };

  // Save image to local disk
  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    sound.playTap();

    try {
      // Small pause for SVG and background rendering settle
      await new Promise((r) => setTimeout(r, 140));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3, // High definition 3x crisp export for mobile / desktop
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `心愿纪念卡_${wish.title.replace(/[\\/:*?"<>|]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      sound.playCelebration();
      fireConfetti(2200);
      setSaveSuccessTip(true);
      setTimeout(() => setSaveSuccessTip(false), 4500);
    } catch (err) {
      console.error('Failed to export card image:', err);
      alert('保存图片失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // System Share
  const handleShare = async () => {
    sound.playTap();
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `心愿纪念卡_${wish.title}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `心愿达成纪念：${wish.title}`,
          text: `我们家达成了心愿「${wish.title}」！这是全家人的成长纪念手帐卡片。`,
          files: [file],
        });
      } else {
        // Fallback download if share not supported
        const link = document.createElement('a');
        link.download = `心愿纪念卡_${wish.title.replace(/[\\/:*?"<>|]/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        setShareTip('已为您下载图片，可直接发送给微信好友或朋友圈！');
        setTimeout(() => setShareTip(null), 4000);
      }
    } catch (err) {
      console.error('Share action failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Layout-specific dimension presets
  const layoutSettings = {
    balanced: {
      cardPadding: 'p-5 sm:p-6',
      iconBoxSize: 'w-12 h-12 text-2xl',
      titleSize: 'text-lg sm:text-xl font-extrabold',
      journeyHeight: 'h-48 sm:h-52',
      svgHeight: 180,
      journeyViewBox: '0 0 280 180',
      stampSize: 'w-12 h-12 text-[11px]',
      stampAngle: 'rotate-[12deg]',
    },
    prominent_title: {
      cardPadding: 'p-5 sm:p-6',
      iconBoxSize: 'w-14 h-14 text-3xl',
      titleSize: 'text-xl sm:text-2xl font-black',
      journeyHeight: 'h-44 sm:h-46',
      svgHeight: 175,
      journeyViewBox: '0 0 280 175',
      stampSize: 'w-14 h-14 text-xs font-black',
      stampAngle: 'rotate-[15deg]',
    },
    journey_focus: {
      cardPadding: 'p-4 sm:p-5',
      iconBoxSize: 'w-11 h-11 text-xl',
      titleSize: 'text-base sm:text-lg font-bold',
      journeyHeight: 'h-56 sm:h-60',
      svgHeight: 195,
      journeyViewBox: '0 0 280 195',
      stampSize: 'w-12 h-12 text-[11px]',
      stampAngle: 'rotate-[10deg]',
    },
  }[pref.layout];

  // Visual text styles based on photo mode vs procedural mode
  const textShadowStyle = isPhotoMode
    ? { textShadow: '0 2px 8px rgba(0, 0, 0, 0.38), 0 1px 2px rgba(0, 0, 0, 0.65)' }
    : undefined;

  const cardTextColor = isPhotoMode ? '#FFFFFF' : theme.textColor;
  const cardSubTextColor = isPhotoMode ? 'rgba(255, 255, 255, 0.88)' : theme.subTextColor;
  const cardQuoteColor = isPhotoMode ? '#FFFDF8' : theme.quoteColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#231E18]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[96vh] bg-[#FAF7F0] rounded-3xl border border-[#DFD3BE] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoFileChange}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FFFDF8] border-b border-[#EAE0CD] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖼️</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#3E3326] flex items-center gap-2">
                <span>导出心愿纪念卡</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8C6920] border border-amber-300 font-bold">
                  9:16 精致竖版
                </span>
                {isPhotoMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold">
                    📷 照片氛围模式
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#827260]">
                极简少字 · 艺术旅程 · 一眼见证心愿圆满
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#8C7A68] hover:text-[#4A3D30] hover:bg-[#EFE8DA] transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Toolbar Controls (换样式 / 换色系或照片模板 / 换版式 / 配照片) */}
        <div className="px-4 py-2.5 bg-[#F5EFE3] border-b border-[#E7DBC7] flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 select-none">
          {/* 1. 换个样式 */}
          <button
            onClick={handleRandomizeStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFFDF9] border border-[#D8CABE] text-[#5C4C3B] font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={
              isPhotoMode
                ? '在轻盈/静谧/暖旧三套照片氛围模板间切换'
                : '重新计算背景渐变与随机装饰元素'
            }
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isPhotoMode ? `🔄 换个样式 (${photoConfig.label})` : '🔄 换个样式'}
            </span>
          </button>

          {/* 2. 模式切换：程序生成（清晨/午后/夜晚）或 照片模式（轻盈/静谧/暖旧） */}
          {!isPhotoMode ? (
            <div className="flex items-center gap-1 bg-[#E8DEC9] p-0.5 rounded-xl">
              <button
                onClick={() => handleSelectTone('morning')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.tone === 'morning'
                    ? 'bg-white text-[#295650] shadow-xs'
                    : 'text-[#6D5D4C] hover:text-[#295650]'
                }`}
              >
                <Sun className="w-3 h-3 text-cyan-600" />
                <span>清晨</span>
              </button>
              <button
                onClick={() => handleSelectTone('afternoon')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.tone === 'afternoon'
                    ? 'bg-white text-[#8A5F1E] shadow-xs'
                    : 'text-[#6D5D4C] hover:text-[#8A5F1E]'
                }`}
              >
                <Sunset className="w-3 h-3 text-amber-500" />
                <span>午后</span>
              </button>
              <button
                onClick={() => handleSelectTone('night')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.tone === 'night'
                    ? 'bg-[#2A3442] text-[#F3EDDC] shadow-xs'
                    : 'text-[#6D5D4C] hover:text-[#2A3442]'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>夜晚</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#E8DEC9] p-0.5 rounded-xl">
              <button
                onClick={() => handleSelectPhotoTemplate('light')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.photoTemplate === 'light'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-[#6D5D4C] hover:text-emerald-800'
                }`}
                title="微模糊低透明度，清新透亮"
              >
                轻盈版
              </button>
              <button
                onClick={() => handleSelectPhotoTemplate('serene')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.photoTemplate === 'serene'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-[#6D5D4C] hover:text-indigo-900'
                }`}
                title="重度虚化深色调，文字对比度最高最易读"
              >
                静谧版
              </button>
              <button
                onClick={() => handleSelectPhotoTemplate('warm_vintage')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  pref.photoTemplate === 'warm_vintage'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-[#6D5D4C] hover:text-amber-900'
                }`}
                title="怀旧暖黄色调相册质感"
              >
                暖旧版
              </button>
            </div>
          )}

          {/* 3. 换版式 (居中均衡 / 大标题沉浸 / 旅程优先) */}
          <div className="flex items-center gap-1 bg-[#E8DEC9] p-0.5 rounded-xl">
            <button
              onClick={() => handleSelectLayout('balanced')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                pref.layout === 'balanced'
                  ? 'bg-white text-[#4A3C2D] shadow-xs'
                  : 'text-[#6D5D4C] hover:text-[#4A3C2D]'
              }`}
              title="标题与图标居顶，旅程曲线占据中央，鼓励语紧凑置底"
            >
              居中均衡
            </button>
            <button
              onClick={() => handleSelectLayout('prominent_title')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                pref.layout === 'prominent_title'
                  ? 'bg-white text-[#4A3C2D] shadow-xs'
                  : 'text-[#6D5D4C] hover:text-[#4A3C2D]'
              }`}
              title="标题与印章比例放大，紧凑沉浸"
            >
              大标题
            </button>
            <button
              onClick={() => handleSelectLayout('journey_focus')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                pref.layout === 'journey_focus'
                  ? 'bg-white text-[#4A3C2D] shadow-xs'
                  : 'text-[#6D5D4C] hover:text-[#4A3C2D]'
              }`}
              title="旅程曲线展开更大纵向空间，节点更大更突出"
            >
              旅程优先
            </button>
          </div>

          {/* 4. 照片背景模式操作入口（配一张照片 / 换照片 / 移除照片） */}
          <div className="flex items-center gap-1.5">
            {!isPhotoMode ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-300/80 text-[#6B4E17] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="上传一张心愿照片，将自动进行氛围虚化与渐晕融图"
              >
                <Camera className="w-3.5 h-3.5 text-[#8C6920]" />
                <span>📷 配一张照片</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FDF9F0] border border-[#D5C6B5] text-[#554534] font-semibold transition-all active:scale-95 cursor-pointer"
                  title="更换另一张照片"
                >
                  <Camera className="w-3 h-3 text-[#7B6349]" />
                  <span>换照片</span>
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-xl text-[#8E7966] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                  title="删除照片，退回程序生成背景模式"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Center: Live Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-[#E5DCBE]/40">
          {/* THE CAPTURED EXPORT CARD ELEMENT (9:16 Ratio Base 320x568) */}
          <div
            ref={cardRef}
            className={`w-[320px] h-[568px] rounded-3xl ${layoutSettings.cardPadding} relative flex flex-col justify-between overflow-hidden shrink-0 shadow-xl border select-none transition-colors duration-300`}
            style={
              isPhotoMode
                ? {
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#FFFFFF',
                  }
                : {
                    ...theme.gradientStyle,
                    borderColor: theme.cardBorderColor,
                    color: theme.textColor,
                  }
            }
          >
            {/* BACKGROUND LAYER: Photo Mode (Cover + Blur + Tint + Vignette) OR Procedural SVG Organic Shapes */}
            {isPhotoMode ? (
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
                {/* 1. Heavy Blurred + Saturated Photo Image */}
                <div
                  className="absolute -inset-6 bg-cover bg-center transition-all duration-300 transform-gpu"
                  style={{
                    backgroundImage: `url(${pref.photoUrl})`,
                    filter: photoConfig.filter,
                  }}
                />
                {/* 2. Atmosphere Tint Mask (low/medium opacity overlay matching template) */}
                <div
                  className="absolute inset-0 transition-colors duration-300"
                  style={{ backgroundColor: photoConfig.overlayTint }}
                />
                {/* 3. Vignette mask: Top slightly dark 12-14%, Bottom distinct dark 38-42% */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.06) 55%, rgba(0,0,0,0.42) 100%)',
                  }}
                />
              </div>
            ) : (
              theme.svgDecorations
            )}

            {/* 1. TOP RIGHT: COMPLETION STAMP (完成印章) */}
            <div
              className={`absolute top-4 right-4 ${layoutSettings.stampSize} rounded-full border-2 border-dashed flex flex-col items-center justify-center shadow-xs select-none z-20 ${layoutSettings.stampAngle}`}
              style={
                isPhotoMode
                  ? {
                      borderColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      backdropFilter: 'blur(8px)',
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    }
                  : {
                      borderColor: theme.stampBorderColor,
                      color: theme.stampTextColor,
                      backgroundColor:
                        pref.tone === 'night'
                          ? 'rgba(45, 55, 70, 0.75)'
                          : 'rgba(255, 253, 248, 0.75)',
                    }
              }
            >
              <div className="text-[7px] tracking-wider uppercase font-mono opacity-80 leading-none mb-0.5">
                ✦ SEAL ✦
              </div>
              <div className="font-black leading-none tracking-tight">已实现</div>
              <div className="text-[7px] opacity-70 leading-none mt-0.5">★</div>
            </div>

            {/* 2. TOP MAIN AREA: WISH ICON + TITLE + DATE SPAN */}
            <div className="relative z-10 pt-1">
              {/* Category Icon */}
              <div
                className={`${layoutSettings.iconBoxSize} rounded-2xl flex items-center justify-center mb-2.5 shadow-sm border`}
                style={
                  isPhotoMode
                    ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.22)',
                        borderColor: 'rgba(255, 255, 255, 0.45)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }
                    : {
                        backgroundColor: theme.nodeBg,
                        borderColor: theme.cardBorderColor,
                      }
                }
              >
                <span>{theme.themeIcons.mainEmoji}</span>
              </div>

              {/* Wish Title (Single line prominent) */}
              <h1
                className={`${layoutSettings.titleSize} tracking-tight leading-snug line-clamp-1 mb-1 pr-14`}
                style={{
                  color: cardTextColor,
                  ...textShadowStyle,
                }}
                title={wish.title}
              >
                {wish.title}
              </h1>

              {/* Date Span: "起始日期 → 完成日期" */}
              <div
                className="text-[11px] font-mono tracking-wide"
                style={{
                  color: cardSubTextColor,
                  ...textShadowStyle,
                }}
              >
                {dateSpanText}
              </div>
            </div>

            {/* 3. MIDDLE: JOURNEY VISUALIZATION AREA (核心功能点) */}
            <div className={`relative z-10 my-auto ${layoutSettings.journeyHeight} flex flex-col justify-center`}>
              <div className="relative w-full h-[145px] sm:h-[155px]">
                {/* SVG Visualizing the Ascending Journey Curve */}
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={layoutSettings.journeyViewBox}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Shadow filter for white text on photo background */}
                    <filter id="photoTextShadow" x="-25%" y="-25%" width="150%" height="150%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.85" />
                    </filter>
                    <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop
                        offset="0%"
                        stopColor={isPhotoMode ? '#FFEAA5' : theme.curveStroke}
                        stopOpacity="0.55"
                      />
                      <stop
                        offset="60%"
                        stopColor={isPhotoMode ? '#FFD45E' : theme.curveStroke}
                        stopOpacity="0.9"
                      />
                      <stop
                        offset="100%"
                        stopColor={isPhotoMode ? '#FFC738' : theme.curveStroke}
                        stopOpacity="1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Main Journey Path Curve */}
                  <path
                    d="M 38 120 C 85 118, 100 80, 140 80 C 180 80, 205 56, 240 52"
                    fill="none"
                    stroke="url(#curveGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="5 4"
                  />

                  {/* Ambient Glow along the Path */}
                  <path
                    d="M 38 120 C 85 118, 100 80, 140 80 C 180 80, 205 56, 240 52"
                    fill="none"
                    stroke={isPhotoMode ? 'rgba(255, 212, 94, 0.45)' : theme.curveGlow}
                    strokeWidth="9"
                    strokeLinecap="round"
                    opacity="0.45"
                  />

                  {/* CASE A: Few steps (N <= 6) -> Insert 1-3 small decorative icon nodes */}
                  {isFewSteps && (
                    <g>
                      {/* Decorative node 1 between start and mid */}
                      <circle
                        cx="88"
                        cy="100"
                        r="10"
                        fill={isPhotoMode ? 'rgba(255,255,255,0.22)' : theme.nodeHaloColor}
                      />
                      <circle
                        cx="88"
                        cy="100"
                        r="7"
                        fill={isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.nodeBg}
                        stroke={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        strokeWidth="1"
                      />
                      <text
                        x="88"
                        y="103.5"
                        fontSize="8.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {theme.themeIcons.decorPool[0] || '💧'}
                      </text>

                      {/* Decorative node 2 between mid and end */}
                      <circle
                        cx="192"
                        cy="64"
                        r="10"
                        fill={isPhotoMode ? 'rgba(255,255,255,0.22)' : theme.nodeHaloColor}
                      />
                      <circle
                        cx="192"
                        cy="64"
                        r="7"
                        fill={isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.nodeBg}
                        stroke={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        strokeWidth="1"
                      />
                      <text
                        x="192"
                        y="67.5"
                        fontSize="8.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {theme.themeIcons.decorPool[1] || '✨'}
                      </text>

                      {/* Optional 3rd decor node if steps >= 4 */}
                      {actualStepsCount >= 4 && (
                        <>
                          <circle
                            cx="114"
                            cy="88"
                            r="8"
                            fill={isPhotoMode ? 'rgba(255,255,255,0.22)' : theme.nodeHaloColor}
                          />
                          <circle
                            cx="114"
                            cy="88"
                            r="5.5"
                            fill={isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.nodeBg}
                            stroke={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                            strokeWidth="1"
                          />
                          <text
                            x="114"
                            y="91"
                            fontSize="7.5"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {theme.themeIcons.decorPool[2] || '🍃'}
                          </text>
                        </>
                      )}
                    </g>
                  )}

                  {/* CASE B: Many steps (N > 6) -> Compressed small dots + "+N" badge */}
                  {!isFewSteps && (
                    <g>
                      {/* Segment 1 (start to mid) dots */}
                      <circle
                        cx="65"
                        cy="116"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />
                      <circle
                        cx="88"
                        cy="105"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />
                      <circle
                        cx="112"
                        cy="90"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />

                      {/* Segment 1 compressed badge */}
                      <g transform="translate(74, 122)">
                        <rect
                          x="0"
                          y="0"
                          width="28"
                          height="14"
                          rx="7"
                          fill={isPhotoMode ? 'rgba(0,0,0,0.45)' : theme.badgeBg}
                          stroke={isPhotoMode ? 'rgba(255,255,255,0.8)' : theme.curveStroke}
                          strokeWidth="0.8"
                        />
                        <text
                          x="14"
                          y="10"
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fill={isPhotoMode ? '#FFFFFF' : theme.badgeText}
                        >
                          +{n1}
                        </text>
                      </g>

                      {/* Segment 2 (mid to end) dots */}
                      <circle
                        cx="168"
                        cy="73"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />
                      <circle
                        cx="192"
                        cy="63"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />
                      <circle
                        cx="216"
                        cy="56"
                        r="2.5"
                        fill={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                        opacity="0.9"
                      />

                      {/* Segment 2 compressed badge */}
                      <g transform="translate(180, 80)">
                        <rect
                          x="0"
                          y="0"
                          width="28"
                          height="14"
                          rx="7"
                          fill={isPhotoMode ? 'rgba(0,0,0,0.45)' : theme.badgeBg}
                          stroke={isPhotoMode ? 'rgba(255,255,255,0.8)' : theme.curveStroke}
                          strokeWidth="0.8"
                        />
                        <text
                          x="14"
                          y="10"
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fill={isPhotoMode ? '#FFFFFF' : theme.badgeText}
                        >
                          +{n2}
                        </text>
                      </g>
                    </g>
                  )}

                  {/* 1. START KEY NODE (Left Bottom) */}
                  <g>
                    <circle
                      cx="38"
                      cy="120"
                      r="17"
                      fill={isPhotoMode ? 'rgba(255,255,255,0.25)' : theme.nodeHaloColor}
                    />
                    <circle
                      cx="38"
                      cy="120"
                      r="12"
                      fill={isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.nodeBg}
                      stroke={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                      strokeWidth="1.5"
                    />
                    <text
                      x="38"
                      y="124.5"
                      fontSize="12.5"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {theme.themeIcons.startIcon}
                    </text>
                    {/* Label placed below icon, larger font (>=13px bold) */}
                    <text
                      x="38"
                      y="152"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={isPhotoMode ? '#FFFFFF' : theme.textColor}
                      filter={isPhotoMode ? 'url(#photoTextShadow)' : undefined}
                    >
                      种下种子
                    </text>
                  </g>

                  {/* 2. MID KEY NODE (Center/Upper) */}
                  <g>
                    <circle
                      cx="140"
                      cy="80"
                      r="18"
                      fill={isPhotoMode ? 'rgba(255,255,255,0.25)' : theme.nodeHaloColor}
                    />
                    <circle
                      cx="140"
                      cy="80"
                      r="13"
                      fill={isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.nodeBg}
                      stroke={isPhotoMode ? '#FFFFFF' : theme.curveStroke}
                      strokeWidth="1.5"
                    />
                    <text
                      x="140"
                      y="84.5"
                      fontSize="13"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {theme.themeIcons.midIcon}
                    </text>
                    {/* Label placed above icon, larger font (>=13px bold) */}
                    <text
                      x="140"
                      y="52"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={isPhotoMode ? '#FFFFFF' : theme.textColor}
                      filter={isPhotoMode ? 'url(#photoTextShadow)' : undefined}
                    >
                      迎风生长
                    </text>
                  </g>

                  {/* 3. END KEY NODE (Right Upper - Largest & Radiant) */}
                  <g>
                    {/* Enhanced outer radiant glow rings */}
                    <circle
                      cx="240"
                      cy="52"
                      r="28"
                      fill={isPhotoMode ? 'rgba(255, 215, 95, 0.45)' : theme.endNodeHaloColor}
                      opacity="0.45"
                    />
                    <circle
                      cx="240"
                      cy="52"
                      r="22"
                      fill={isPhotoMode ? 'rgba(255, 215, 95, 0.4)' : theme.endNodeHaloColor}
                    />
                    <circle
                      cx="240"
                      cy="52"
                      r="16"
                      fill={isPhotoMode ? 'rgba(255, 240, 180, 0.35)' : theme.endNodeBg}
                      stroke={isPhotoMode ? '#FFE580' : theme.curveStroke}
                      strokeWidth="2"
                    />
                    <text
                      x="240"
                      y="57.5"
                      fontSize="16.5"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {theme.themeIcons.endIcon}
                    </text>
                    {/* Label placed above icon, larger font (>=13px bold) */}
                    <text
                      x="240"
                      y="22"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={isPhotoMode ? '#FFFFFF' : theme.textColor}
                      filter={isPhotoMode ? 'url(#photoTextShadow)' : undefined}
                    >
                      达成心愿
                    </text>
                  </g>
                </svg>
              </div>

              {/* Path Bottom Summary Text: "这一路，共努力了 {N} 次" */}
              <div
                className="text-center text-[11px] font-bold tracking-wider mt-1 opacity-90"
                style={{
                  color: cardSubTextColor,
                  ...textShadowStyle,
                }}
              >
                这一路，共努力了 {actualStepsCount} 次
              </div>
            </div>

            {/* 4. BELOW JOURNEY: PARTICIPANT COLOR DISCS (参与人色块) */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 py-1">
              {participatingMembers.map(({ member, abbr }) => (
                <div
                  key={member.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-2xs border"
                  style={{
                    backgroundColor: member.colorTag,
                    borderColor: isPhotoMode ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
                  }}
                  title={`${member.name} (${member.role})`}
                >
                  <span>{abbr}</span>
                </div>
              ))}
            </div>

            {/* 5. BOTTOM: FEATURED ENCOURAGEMENT QUOTE (精选鼓励语) */}
            <div
              className="relative z-10 pt-2.5 border-t"
              style={{
                borderColor: isPhotoMode ? 'rgba(255,255,255,0.3)' : theme.dividerColor,
              }}
            >
              <div className="relative px-2 text-center">
                <p
                  className="font-handwriting text-[13px] sm:text-[14px] leading-relaxed italic line-clamp-2"
                  style={{
                    color: cardQuoteColor,
                    ...textShadowStyle,
                  }}
                >
                  “{featuredEncouragement}”
                </p>
              </div>

              {/* 6. BOTTOM RIGHT: BRAND WATERMARK (品牌小字) */}
              <div
                className="mt-2 text-right text-[9px] font-mono tracking-widest opacity-80 pr-1"
                style={{
                  color: cardSubTextColor,
                  ...textShadowStyle,
                }}
              >
                {brandWatermark}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-3 sm:p-4 bg-[#FFFDF8] border-t border-[#ECE0CC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#7A6956] flex items-center gap-1.5">
            <span className="text-amber-600">✨</span>
            <span>
              已自动记忆您的样式偏好。保存后为 9:16 超清纪念长卡，可随时分享。
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#EFE8DC] hover:bg-[#E5DDCF] active:scale-95 text-[#544534] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>系统分享</span>
            </button>

            <button
              onClick={handleSaveImage}
              disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-2xl bg-linear-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-95 text-[#3A2800] text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#3A2800]" />
                  <span>渲染生成中...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>保存图片</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Floating Success Toasts & Hints */}
        {saveSuccessTip && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-60 bg-[#2D241B] text-[#FFFDF8] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>🎉 心愿纪念卡已保存到本地！可在相册中查看或分享给亲友。</span>
          </div>
        )}

        {photoTip && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-60 bg-[#1E2530] text-[#FFFDF8] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{photoTip}</span>
          </div>
        )}

        {shareTip && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-60 bg-[#2D241B] text-[#FFFDF8] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{shareTip}</span>
          </div>
        )}
      </div>
    </div>
  );
};
