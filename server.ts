import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Generate mood text and encouragement for a wish step
app.post('/api/gemini/generate-step', async (req: Request, res: Response) => {
  try {
    const {
      wishTitle,
      wishNote,
      stepNumber,
      stepContent,
      stepOwners,
      previousMoods = [],
      previousEncouragements = [],
    } = req.body;

    if (!ai) {
      // If server has no key configured, return fallback flag so client uses fallback
      return res.status(200).json({
        fallback: true,
        moodText: '今天也为心愿迈出了一大步！',
        encouragement: '一点一滴的积累，正在悄悄变成现实哦！',
      });
    }

    const previousContext = [
      previousMoods.length > 0 ? `该心愿此前的心情句有：${previousMoods.join('；')}` : '',
      previousEncouragements.length > 0 ? `该心愿此前的鼓励语有：${previousEncouragements.join('；')}` : '',
    ].filter(Boolean).join('\n');

    const prompt = `
心愿标题：“${wishTitle || '未知心愿'}”
心愿描述：“${wishNote || '无'}”
这是第 ${stepNumber || 1} 步进展。
这一步参与者：${(stepOwners && stepOwners.length > 0) ? stepOwners.join('、') : '家人'}
这一步做了什么：“${stepContent || '付出了努力'}”

历史记录参考（注意：本次生成的句子坚决不能与以下历史内容重复或高度雷同）：
${previousContext || '无历史记录，这是第一步。'}

请根据以上信息，生成：
1. moodText (心情一句话)：对当前状态的生动拟人化短句，15-25字左右，温暖俏皮。
2. encouragement (鼓励语)：对本次努力的真诚肯定和加油，15-25字左右，像家人自然对话，语气积极阳光，11岁儿子和父母都能感受到力量。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '你是一个专为一家三口（11岁儿子、爸爸、妈妈）设计的家庭成长陪伴手帐助手。请生成一句简短拟人的【心情一句话】和一句温情的【鼓励语】。必须以JSON格式输出。语气温暖亲切、生活化、不讲大道理、不评分，11岁男孩听了觉得亲切有力量，严格杜绝与历史句子重复。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodText: {
              type: Type.STRING,
              description: '心情一句话，拟人化短句，15-25字左右',
            },
            encouragement: {
              type: Type.STRING,
              description: '鼓励语，真诚肯定与加油，15-25字左右',
            },
          },
          required: ['moodText', 'encouragement'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    let parsedData = { moodText: '', encouragement: '' };
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      parsedData = {
        moodText: '今天也为心愿写下了温暖的篇章！',
        encouragement: '一步步向前走，美好的心愿一定能开花结果！',
      };
    }

    if (!parsedData.moodText) {
      parsedData.moodText = '今天的心情像被暖阳照亮了一样！';
    }
    if (!parsedData.encouragement) {
      parsedData.encouragement = '每一次小小的坚持，都是最棒的成长印记！';
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('Gemini generation error:', error);
    // Return friendly fallback rather than crashing
    return res.status(200).json({
      fallback: true,
      moodText: '今天的努力已被悄悄记录下来啦！',
      encouragement: '只要全家人一起向前，心愿就在不远处等你！',
    });
  }
});

// API Route: Generate heartwarming narrative story linking wish history into a cohesive short text
app.post('/api/gemini/generate-story', async (req: Request, res: Response) => {
  try {
    const {
      wishTitle,
      wishNote,
      owners = [],
      createdAt,
      completedAt,
      steps = [],
    } = req.body;

    const buildFallbackStory = () => {
      const stepDescs = steps.map((s: any, idx: number) => `第${idx + 1}步「${s.content || '全家努力'}」`).join('，接着');
      const stepSummary = steps.length > 0 ? `一路走来，全家齐心经历了${stepDescs}` : '在全家人的悉心坚持与呵护下';
      return {
        fallback: true,
        story: `在这个充满期待的心愿「${wishTitle || '未知心愿'}」被郑重写下的那天起，家里便多了一份特别的向心力。${stepSummary}，每一个小小的付出都像是一颗播撒在日常里的种子，在彼此的陪伴中悄然生根发芽。如今心愿圆满达成，回头翻阅这些脚踏实地的日子，最动人的不仅是愿望成真的欣喜，更是全家三口并肩同行的温暖温度。`,
        highlightQuote: '愿望开花的那一刻，照亮的是我们全家人一起走过的每一步。',
        familySignOff: '爱在日常，岁月有光 · 全家永久珍藏',
        tags: ['家庭里程碑', '一路同行', '温情记忆', '心愿达成'],
      };
    };

    if (!ai) {
      return res.status(200).json(buildFallbackStory());
    }

    const stepsText = steps.length > 0
      ? steps.map((s: any, idx: number) => `第 ${idx + 1} 步（${s.date || '某天'}，参与：${(s.by || []).join('、')}）：做了「${s.content}」；当时心情：「${s.moodText || '充实快乐'}」；鼓励：「${s.encouragement || '加油'}」`).join('\n')
      : '暂无详细中间步骤，直接在全家共同努力下圆满达成。';

    const prompt = `
心愿标题：“${wishTitle || '未知心愿'}”
心愿初衷/背景：“${wishNote || '无具体说明'}”
心愿归属/主角：${owners.join('、') || '全家一起'}
许下时间：${createdAt || '初始之时'}
达成时间：${completedAt || '近期'}

整个过程的真实足迹与努力记录：
${stepsText}

用户的核心要求：
“不要简单地把详情页生成一张手机图片。最好利用AI将这过程形成一个小文，文字之间有这些过程的记录。文字不用太多。连贯就好。”

请你写一段温馨、连贯、生动感人的【家庭心愿成长纪念小文】（180-260字左右）：
要求：
1. 语言温暖亲切，如同一位充满爱意的家庭手帐记录者，有娓娓道来的叙事感；
2. 连贯自然地把心愿的萌芽、真实的足迹内容、中间的关键努力、以及最后达成时的家庭感动串联起来，千万不要写成生硬的罗列或流水账；
3. 文字不用太多，连贯、真挚、有回味感；
4. 适合一家三口（11岁儿子、爸爸、妈妈）在多年后翻看时依然相视一笑，心生暖意。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '你是一个专为温馨家庭（11岁儿子与父母）撰写真挚成长手帐的散文随笔家。擅长将琐碎的成长点滴和努力步骤，凝练成一段短小精炼、连贯流淌、充满爱与温度的纪实小文（180-260字）。不讲大道理，真诚而有诗意。必须以JSON格式输出。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: {
              type: Type.STRING,
              description: '连贯温暖的纪念小文，将整个过程记录自然串联，180-260字左右',
            },
            highlightQuote: {
              type: Type.STRING,
              description: '一句提炼家庭温情与心愿达成的金句，20-30字',
            },
            familySignOff: {
              type: Type.STRING,
              description: '落款寄语印记，如“爱在日常，岁月有光 · 全家永久珍藏”，15-25字',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4个温情标签，如“并肩同行”、“小小里程碑”',
            },
          },
          required: ['story', 'highlightQuote', 'familySignOff', 'tags'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    let parsedData = { story: '', highlightQuote: '', familySignOff: '', tags: [] as string[] };
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      parsedData = buildFallbackStory();
    }

    if (!parsedData.story) {
      parsedData.story = buildFallbackStory().story;
    }
    if (!parsedData.highlightQuote) {
      parsedData.highlightQuote = '愿望开花的那一刻，照亮的是我们全家人一起走过的每一步。';
    }
    if (!parsedData.familySignOff) {
      parsedData.familySignOff = '爱在日常，岁月有光 · 全家永久珍藏';
    }
    if (!parsedData.tags || !Array.isArray(parsedData.tags) || parsedData.tags.length === 0) {
      parsedData.tags = ['家庭里程碑', '一路同行', '温情记忆', '心愿达成'];
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('Gemini story generation error:', error);
    const stepDescs = (req.body.steps || []).map((s: any, idx: number) => `第${idx + 1}步「${s.content || '全家努力'}」`).join('，接着');
    const stepSummary = (req.body.steps || []).length > 0 ? `一路走来，全家齐心经历了${stepDescs}` : '在全家人的悉心坚持与呵护下';
    return res.status(200).json({
      fallback: true,
      story: `在这个充满期待的心愿「${req.body.wishTitle || '未知心愿'}」被郑重写下的那天起，家里便多了一份特别的向心力。${stepSummary}，每一个小小的付出都像是一颗播撒在日常里的种子，在彼此的陪伴中悄然生根发芽。如今心愿圆满达成，回头翻阅这些脚踏实地的日子，最动人的不仅是愿望成真的欣喜，更是全家三口并肩同行的温暖温度。`,
      highlightQuote: '愿望开花的那一刻，照亮的是我们全家人一起走过的每一步。',
      familySignOff: '爱在日常，岁月有光 · 全家永久珍藏',
      tags: ['家庭里程碑', '一路同行', '温情记忆', '心愿达成'],
    });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
