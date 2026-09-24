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
