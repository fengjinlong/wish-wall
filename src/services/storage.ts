import { FamilyData, Member, Wish, ProgressStep, MemberId } from '../types';

export const STORAGE_KEY = 'family-wishlist-data';

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'son',
    name: '乐乐',
    avatar: '👦',
    role: '儿子 (11岁)',
    colorTag: '#4E8199',   // 雾霾蓝
    lightColor: '#EBF3F7',
    borderColor: '#7AA2B5',
  },
  {
    id: 'dad',
    name: '大树爸爸',
    avatar: '👨',
    role: '爸爸',
    colorTag: '#7A6852',   // 大地浅棕木色
    lightColor: '#F3EFEA',
    borderColor: '#A89885',
  },
  {
    id: 'mom',
    name: '暖暖妈妈',
    avatar: '👩',
    role: '妈妈',
    colorTag: '#C77959',   // 暖杏色
    lightColor: '#FAF0EB',
    borderColor: '#E09C82',
  },
];

export const CATEGORY_OPTIONS = [
  { id: 'star', label: '美好心愿', icon: 'Sparkles', color: '#D4A346' },
  { id: 'travel', label: '旅行户外', icon: 'Compass', color: '#5B8EA6' },
  { id: 'study', label: '成长学习', icon: 'BookOpen', color: '#6A8E6A' },
  { id: 'sport', label: '运动健身', icon: 'Trophy', color: '#C77959' },
  { id: 'family', label: '家庭温馨', icon: 'Heart', color: '#8C7B65' },
  { id: 'hobby', label: '兴趣创造', icon: 'Palette', color: '#A07E9B' },
  { id: 'food', label: '美食探味', icon: 'UtensilsCrossed', color: '#C88D4B' },
  { id: 'outdoor', label: '露营探索', icon: 'Tent', color: '#588B76' },
];

export const DECO_ICONS = [
  { id: 'sun', label: '小太阳', symbol: '☀️' },
  { id: 'sprout', label: '小嫩芽', symbol: '🌱' },
  { id: 'clover', label: '四叶草', symbol: '🍀' },
  { id: 'flower', label: '小雏菊', symbol: '🌼' },
  { id: 'star', label: '闪耀星', symbol: '✨' },
  { id: 'rainbow', label: '小彩虹', symbol: '🌈' },
];

// Helper to calculate 3D sphere positions nicely distributed
export function calculate3DPositions(count: number, radius = 290) {
  const positions: Array<{ x: number; y: number; z: number; rx: number; ry: number }> = [];
  if (count === 0) return positions;

  for (let i = 0; i < count; i++) {
    // Golden spiral distribution on sphere surface
    const phi = Math.acos(-1 + (2 * i + 1) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;

    const x = Math.round(radius * Math.sin(phi) * Math.cos(theta));
    const y = Math.round(radius * 0.75 * Math.cos(phi)); // Flatten vertical spread slightly for widescreen
    const z = Math.round(radius * Math.sin(phi) * Math.sin(theta));

    // Slight rotation to face gently outwards
    const ry = Math.round((-theta * 180) / Math.PI + 90);
    const rx = Math.round((y / radius) * -20);

    positions.push({ x, y, z, rx, ry });
  }

  return positions;
}

export const INITIAL_WISHES: Wish[] = [
  {
    id: 'wish-1',
    title: '带乐乐去海边露营看星空',
    note: '在沙滩上支起帐篷，听着浪涛数满天的银河星斗，做一次真正的野外探险！',
    categoryIcon: 'outdoor',
    decoIcon: 'star',
    owners: ['all'],
    createdBy: 'dad',
    createdAt: '2026-08-15T09:00:00.000Z',
    status: '进行中',
    completedAt: null,
    position3D: { x: -160, y: -40, z: 120, rx: 5, ry: -25 },
    progressSteps: [
      {
        id: 'step-1-1',
        date: '2026年8月20日',
        by: ['dad', 'son'],
        content: '周末全家一起研究挑选了双人防风星空帐篷和户外露营灯。',
        moodText: '露营灯亮起的瞬间，心里仿佛已经提前装满了星光！',
        encouragement: '装备齐备啦，离我们踩在细软沙滩上的日子又近了一步！',
      },
      {
        id: 'step-1-2',
        date: '2026年9月02日',
        by: ['mom', 'son'],
        content: '乐乐和妈妈在地图上标记了日出最佳观测点，还列好了观星零食清单！',
        moodText: '用彩色笔在地图上画出路线，是最让人雀跃的探险序幕。',
        encouragement: '认真的准备也是旅行最美好的部分，全家人都超有默契！',
      },
    ],
  },
  {
    id: 'wish-2',
    title: '乐乐学会自由泳游满25米',
    note: '战胜深水恐惧，掌握流畅划水换气，拥抱清爽自由的泳池阳光！',
    categoryIcon: 'sport',
    decoIcon: 'sprout',
    owners: ['son', 'dad'],
    createdBy: 'son',
    createdAt: '2026-08-28T14:30:00.000Z',
    status: '进行中',
    completedAt: null,
    position3D: { x: 170, y: 30, z: 90, rx: -5, ry: 20 },
    progressSteps: [
      {
        id: 'step-2-1',
        date: '2026年9月08日',
        by: ['son', 'dad'],
        content: '爸爸陪乐乐在泳池练习连续换气10次，已经完全不呛水了！',
        moodText: '水花里跳跃着小海豚般的勇敢，今天的水感简直太棒了！',
        encouragement: '突破换气这个大关，你比自己想象的还要坚韧聪明！',
      },
    ],
  },
  {
    id: 'wish-3',
    title: '全家完成1000块世界地图拼图',
    note: '周末围坐在客厅地毯上，一块块拼出我们想一起走遍的辽阔大千世界。',
    categoryIcon: 'family',
    decoIcon: 'clover',
    owners: ['all'],
    createdBy: 'mom',
    createdAt: '2026-07-10T10:00:00.000Z',
    status: '已完成',
    completedAt: '2026-08-12T16:20:00.000Z',
    completionNote: '经过全家人多日的默契协作，这幅挂在大书房的世界地图终于完工！',
    position3D: { x: 0, y: 0, z: 150, rx: 0, ry: 0 },
    progressSteps: [
      {
        id: 'step-3-1',
        date: '2026年7月15日',
        by: ['all'],
        content: '把1000块碎片全部倒在拼图毯上，全家分工挑出了边缘四周边框。',
        moodText: '在地毯上围坐在一起，哪怕只是分类找框框都充满了欢声笑语。',
        encouragement: '万里长征第一步，扎实的边框是构建大世界的最牢基石！',
      },
      {
        id: 'step-3-2',
        date: '2026年7月28日',
        by: ['mom', 'son'],
        content: '利用晚饭后的半小时，把亚洲大陆与色彩最复杂的欧非板块拼接成功。',
        moodText: '每听到一声清脆的“卡嗒”咬合，心中就燃起一点小自豪！',
        encouragement: '细心与耐心在悄悄发光，属于我们一家的地理奇迹正在显现！',
      },
      {
        id: 'step-3-3',
        date: '2026年8月12日',
        by: ['dad', 'son'],
        content: '爸爸帮乐乐按上了南极洲最后一块拼图碎片，并一起装上了精美的实木画框！',
        moodText: '最后一块归位的瞬间，整间屋子里都是全家人热烈的欢呼！',
        encouragement: '一千片零散的拼块，拼出了我们家庭最温暖有爱的凝聚力！',
      },
    ],
  },
];

export function getInitialFamilyData(): FamilyData {
  return {
    members: DEFAULT_MEMBERS,
    wishes: INITIAL_WISHES,
    hasCompletedOnboarding: true,
    currentOperatorId: 'son',
  };
}

export function loadFamilyData(): FamilyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialFamilyData();
      saveFamilyData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.members || !Array.isArray(parsed.members)) {
      return getInitialFamilyData();
    }
    return parsed;
  } catch (e) {
    console.error('Error loading family data from localStorage:', e);
    return getInitialFamilyData();
  }
}

export function saveFamilyData(data: FamilyData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving family data to localStorage:', e);
  }
}
