/**
 * ============================================================================
 * 🔑 Google Gemini API 密钥配置处
 *
 * 如果你想直接在前端调用或替换为您自己的 Gemini API Key，请直接修改下方变量：
 * 例如：export const GEMINI_API_KEY = "AIzaSyD-xxxxxxxxxxxxxx";
 *
 * 注：系统默认优先通过服务器 /api/gemini/generate-step 代理调用环境变量中自动注入的 Key。
 * 若无后端或你自行部署静态网页，填入下方常量即可立即启用前端直连调用。
 * ============================================================================
 */
export const GEMINI_API_KEY: string = "";

export interface GenerateStepResult {
  moodText: string;
  encouragement: string;
  isAiGenerated: boolean;
}

// 丰富的温馨短句种子库，用于离线兜底或防重复扩展
const FALLBACK_MOOD_SEEDS = [
  '今天像吃了蜜糖一样，心里每一个细胞都在为你欢呼！',
  '脚踏实地的微小脚步，正悄悄踩出通往心愿的花径。',
  '阳光洒在今天的笔记本上，每个字都闪烁着温暖的光。',
  '今天的心情就像刚烘烤出炉的吐司，热乎乎又踏实！',
  '你看，勇敢迈出的这一步，连天上的白云都在向你挥手呢！',
  '家庭手帐里又添上了浓墨重彩的一笔，心里满是踏实。',
  '悄悄努力的小树苗，今天又偷偷往上拔高了一厘米！',
  '今天的汗水和付出，像春天的细雨一样正在滋养心愿的种子。',
  '一家人同心协力的温度，是世界上最治愈的超能力。',
  '今天的时针走得格外轻快，因为我们离梦想更近了一截！',
];

const FALLBACK_ENCOURAGE_SEEDS = [
  '一点一滴的坚持，终将汇聚成照亮全家记忆的满天繁星！',
  '为你今天的果断与行动力点赞，你比昨天更棒了！',
  '大愿望都是由无数个小确幸铺就的，这一步超有价值！',
  '只要全家人的心在一起，再遥远的心愿也会变成可触及的风景！',
  '这份默默的付出大家都有目共睹，继续保持这份满满的冲劲！',
  '做到了就是最好的开始，期待我们一起迎来庆祝的欢呼时刻！',
  '今天的每一次尝试，都在为你积累闪闪发光的成长勋章！',
  '心愿正微笑着朝你招手呢，加油，幸福就在前方不远处！',
];

export async function generateStepMoodAndEncouragement(params: {
  wishTitle: string;
  wishNote: string;
  stepNumber: number;
  stepContent: string;
  stepOwners: string[];
  previousMoods?: string[];
  previousEncouragements?: string[];
}): Promise<GenerateStepResult> {
  const {
    wishTitle,
    wishNote,
    stepNumber,
    stepContent,
    stepOwners,
    previousMoods = [],
    previousEncouragements = [],
  } = params;

  // 1. 尝试调用后端服务 API (/api/gemini/generate-step)
  try {
    const res = await fetch('/api/gemini/generate-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wishTitle,
        wishNote,
        stepNumber,
        stepContent,
        stepOwners,
        previousMoods,
        previousEncouragements,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.moodText && data.encouragement && !data.fallback) {
        return {
          moodText: data.moodText,
          encouragement: data.encouragement,
          isAiGenerated: true,
        };
      }
    }
  } catch {
    // 后端无法连接或未配置，尝试前端直接请求或降级
  }

  // 2. 如果配置了前端 GEMINI_API_KEY，直接发起官方 Gemini 3.8 Flash 请求
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    try {
      const prompt = `
你是一个专为一家三口（11岁儿子、爸爸、妈妈）设计的家庭成长手帐AI伴侣。
心愿：“${wishTitle}”
心愿描述：“${wishNote}”
这是第 ${stepNumber} 步努力。
参与者：${stepOwners.join('、')}
做了什么：“${stepContent}”

此前已经生成过的心情句：${previousMoods.join('；') || '无'}
此前已经生成过的鼓励语：${previousEncouragements.join('；') || '无'}

请严格注意：本次生成必须是结构化JSON，格式为 {"moodText": "...", "encouragement": "..."}。
坚决不要与上述历史记录重复。
moodText：拟人化当前状态，15-25字，口语温暖、童趣且有生活气息。
encouragement：对付出的肯定和鼓励，15-25字，像家人一样温暖打气。
`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY.trim()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.moodText && parsed.encouragement) {
            return {
              moodText: parsed.moodText,
              encouragement: parsed.encouragement,
              isAiGenerated: true,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Frontend direct Gemini API call failed, falling back to dynamic generator:', err);
    }
  }

  // 3. 兜底保障：智能动态匹配不重复的温暖家庭专属语句，杜绝任何崩溃与空白
  const filteredMoods = FALLBACK_MOOD_SEEDS.filter(
    (m) => !previousMoods.includes(m)
  );
  const filteredEncourages = FALLBACK_ENCOURAGE_SEEDS.filter(
    (e) => !previousEncouragements.includes(e)
  );

  const moodPool = filteredMoods.length > 0 ? filteredMoods : FALLBACK_MOOD_SEEDS;
  const encouragePool =
    filteredEncourages.length > 0 ? filteredEncourages : FALLBACK_ENCOURAGE_SEEDS;

  const randomMood = moodPool[Math.floor(Math.random() * moodPool.length)];
  const randomEncourage =
    encouragePool[Math.floor(Math.random() * encouragePool.length)];

  // 模拟轻柔可爱的AI延时响应
  await new Promise((r) => setTimeout(r, 600));

  return {
    moodText: randomMood,
    encouragement: randomEncourage,
    isAiGenerated: false,
  };
}
