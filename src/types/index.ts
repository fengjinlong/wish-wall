export type MemberId = 'son' | 'dad' | 'mom';

export interface Member {
  id: MemberId;
  name: string;
  avatar: string;
  role: string;
  colorTag: string;      // 专属标识色（柔和护眼低饱和）
  lightColor: string;    // 浅色背景填充
  borderColor: string;   // 边框色
}

export interface ProgressStep {
  id: string;
  date: string;
  by: string[];          // memberId array or includes 'all'
  content: string;       // 用户填写的：这一步做了什么
  moodText: string;      // AI 生成的心情一句话
  encouragement: string; // AI 生成的鼓励语
}

export interface Wish {
  id: string;
  title: string;
  note: string;
  categoryIcon: string;
  decoIcon: string;
  owners: string[];      // 归属人，支持多选或 'all'
  createdBy: string;
  createdAt: string;
  status: '进行中' | '已完成';
  completedAt: string | null;
  completionNote?: string;
  position3D: {
    x: number;
    y: number;
    z: number;
    rx?: number;
    ry?: number;
  };
  progressSteps: ProgressStep[];
}

export interface FamilyData {
  members: Member[];
  wishes: Wish[];
  hasCompletedOnboarding: boolean;
  currentOperatorId: MemberId;
}

export interface CategoryOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface DecoOption {
  id: string;
  label: string;
  symbol: string;
}
