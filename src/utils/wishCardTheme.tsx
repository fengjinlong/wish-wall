/**
 * Parameterized procedural background and theme generator for Wish Cards.
 * Implements deterministic low-saturation, eye-friendly palettes and organic SVG motifs.
 */

import React from 'react';

export type WishCardTone = 'morning' | 'afternoon' | 'night';
export type WishCardLayout = 'balanced' | 'prominent_title' | 'journey_focus';

export interface WishCardPreference {
  seed: number;
  tone: WishCardTone;
  layout: WishCardLayout;
}

export interface GeneratedBackground {
  gradientStyle: React.CSSProperties;
  textColor: string;
  subTextColor: string;
  quoteColor: string;
  stampBorderColor: string;
  stampTextColor: string;
  cardBorderColor: string;
  cardBg: string;
  curveStroke: string;
  curveGlow: string;
  nodeHaloColor: string;
  nodeBg: string;
  endNodeHaloColor: string;
  endNodeBg: string;
  badgeBg: string;
  badgeText: string;
  dividerColor: string;
  svgDecorations: React.ReactNode;
}

// Pseudo-Random Number Generator (Mulberry32)
export function createPRNG(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s === 0) s = 123456789;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Convert wish ID string to an integer seed
export function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Category palette ranges (Low saturation, eye-friendly, gender-neutral)
interface CategoryPalette {
  primaryHue: number;    // Base hue
  secondaryHue: number;  // Shift hue
  satRange: [number, number];
  lightMorning: [number, number];
  lightAfternoon: [number, number];
  lightNight: [number, number];
  themeIcons: {
    startIcon: string;
    midIcon: string;
    endIcon: string;
    decorPool: string[];
    mainEmoji: string;
  };
}

const CATEGORY_PALETTES: Record<string, CategoryPalette> = {
  // 成长学习
  study: {
    primaryHue: 142,   // Sage / bean-paste green
    secondaryHue: 85,  // Olive wood
    satRange: [18, 30],
    lightMorning: [92, 97],
    lightAfternoon: [87, 93],
    lightNight: [18, 26],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '📖',
      endIcon: '🏆',
      decorPool: ['✨', '🍃', '💡', '✏️', '🌟'],
      mainEmoji: '📖',
    },
  },
  // 运动健身
  sport: {
    primaryHue: 28,    // Warm apricot
    secondaryHue: 155, // Mint breeze
    satRange: [22, 35],
    lightMorning: [92, 97],
    lightAfternoon: [88, 93],
    lightNight: [18, 25],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '🏃',
      endIcon: '🏆',
      decorPool: ['🌊', '🐾', '🍃', '☀️', '⚡'],
      mainEmoji: '🏊',
    },
  },
  // 旅行户外 / 露营探索
  travel: {
    primaryHue: 202,   // Smog blue
    secondaryHue: 38,  // Sand dune beige
    satRange: [18, 28],
    lightMorning: [92, 97],
    lightAfternoon: [87, 93],
    lightNight: [19, 27],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '🧭',
      endIcon: '🏔️',
      decorPool: ['☁️', '🐚', '🌊', '⭐', '🐾'],
      mainEmoji: '🗺️',
    },
  },
  outdoor: {
    primaryHue: 165,   // Forest pine & campsite amber
    secondaryHue: 35,
    satRange: [18, 30],
    lightMorning: [92, 97],
    lightAfternoon: [87, 92],
    lightNight: [18, 26],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '⛺',
      endIcon: '🌟',
      decorPool: ['🌲', '🔥', '🍃', '✨', '🐾'],
      mainEmoji: '⛺',
    },
  },
  // 兴趣创造
  hobby: {
    primaryHue: 280,   // Muted dusty lilac / tea rose
    secondaryHue: 32,
    satRange: [16, 26],
    lightMorning: [93, 98],
    lightAfternoon: [88, 94],
    lightNight: [20, 28],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '🎨',
      endIcon: '✨',
      decorPool: ['🖌️', '💧', '🌸', '✨', '🐾'],
      mainEmoji: '🎨',
    },
  },
  // 家庭温馨 / 美食探味 / 通用美好心愿
  family: {
    primaryHue: 36,    // Warm honey oatmeal
    secondaryHue: 18,  // Apricot blush
    satRange: [20, 32],
    lightMorning: [93, 97],
    lightAfternoon: [88, 94],
    lightNight: [18, 25],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '🏡',
      endIcon: '🌟',
      decorPool: ['❤️', '🍀', '✨', '☕', '🐾'],
      mainEmoji: '🏡',
    },
  },
  food: {
    primaryHue: 32,
    secondaryHue: 15,
    satRange: [22, 34],
    lightMorning: [93, 97],
    lightAfternoon: [88, 93],
    lightNight: [18, 25],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '🥢',
      endIcon: '🍲',
      decorPool: ['✨', '🍞', '🍃', '⭐', '🐾'],
      mainEmoji: '🍜',
    },
  },
  star: {
    primaryHue: 42,    // Soft gold & warm ivory
    secondaryHue: 200, // Hint of morning sky
    satRange: [20, 32],
    lightMorning: [93, 98],
    lightAfternoon: [88, 94],
    lightNight: [19, 27],
    themeIcons: {
      startIcon: '🌱',
      midIcon: '⭐',
      endIcon: '🏆',
      decorPool: ['✨', '🐾', '🍃', '🌟', '🍀'],
      mainEmoji: '🌟',
    },
  },
};

// Generate procedural theme from category, tone, and seed
export function generateWishCardTheme(
  categoryIcon: string,
  tone: WishCardTone = 'afternoon',
  seed: number = 42
): GeneratedBackground & { themeIcons: CategoryPalette['themeIcons'] } {
  const prng = createPRNG(seed);
  const palette = CATEGORY_PALETTES[categoryIcon] || CATEGORY_PALETTES.star;

  const sat = palette.satRange[0] + prng() * (palette.satRange[1] - palette.satRange[0]);
  const angle = Math.round(125 + prng() * 45); // 125deg to 170deg

  let lightRange: [number, number];
  let textColor = '#3E342B';
  let subTextColor = '#786957';
  let quoteColor = '#6A5624';
  let stampBorderColor = '#A33E32';
  let stampTextColor = '#A33E32';
  let cardBorderColor = '#E3D7C1';
  let cardBg = '#FFFDF8';
  let curveStroke = '#C89B3C';
  let curveGlow = 'rgba(212, 163, 70, 0.35)';
  let nodeHaloColor = 'rgba(212, 163, 70, 0.25)';
  let nodeBg = '#FFFDF7';
  let endNodeHaloColor = 'rgba(235, 175, 45, 0.45)';
  let endNodeBg = '#FFF8E6';
  let badgeBg = 'rgba(240, 230, 210, 0.85)';
  let badgeText = '#7A6233';
  let dividerColor = '#E6DAC4';

  if (tone === 'morning') {
    lightRange = palette.lightMorning;
    textColor = '#283637';
    subTextColor = '#627375';
    quoteColor = '#2F5C58';
    stampBorderColor = '#2B7068';
    stampTextColor = '#2B7068';
    cardBorderColor = '#D4E2DF';
    cardBg = '#F9FCFA';
    curveStroke = '#4E938D';
    curveGlow = 'rgba(78, 147, 141, 0.3)';
    nodeHaloColor = 'rgba(78, 147, 141, 0.22)';
    nodeBg = '#FFFFFF';
    endNodeHaloColor = 'rgba(78, 147, 141, 0.45)';
    endNodeBg = '#EEF7F5';
    badgeBg = 'rgba(224, 239, 236, 0.88)';
    badgeText = '#295B55';
    dividerColor = '#D8E5E2';
  } else if (tone === 'afternoon') {
    lightRange = palette.lightAfternoon;
    textColor = '#3B3024';
    subTextColor = '#7C6B56';
    quoteColor = '#8A6720';
    stampBorderColor = '#B24233';
    stampTextColor = '#B24233';
    cardBorderColor = '#E7DCB9';
    cardBg = '#FFFDF8';
    curveStroke = '#D19A30';
    curveGlow = 'rgba(209, 154, 48, 0.35)';
    nodeHaloColor = 'rgba(209, 154, 48, 0.22)';
    nodeBg = '#FFFDF8';
    endNodeHaloColor = 'rgba(235, 175, 45, 0.45)';
    endNodeBg = '#FFF5DE';
    badgeBg = 'rgba(245, 235, 215, 0.9)';
    badgeText = '#82652A';
    dividerColor = '#EADDBF';
  } else {
    // Night tone
    lightRange = palette.lightNight;
    textColor = '#F7F4EE';
    subTextColor = '#B9C2C8';
    quoteColor = '#F2D07E';
    stampBorderColor = '#E5B458';
    stampTextColor = '#E5B458';
    cardBorderColor = '#3E4957';
    cardBg = '#1E2530';
    curveStroke = '#E0B55E';
    curveGlow = 'rgba(224, 181, 94, 0.45)';
    nodeHaloColor = 'rgba(224, 181, 94, 0.28)';
    nodeBg = '#283240';
    endNodeHaloColor = 'rgba(245, 200, 95, 0.55)';
    endNodeBg = '#364356';
    badgeBg = 'rgba(54, 67, 86, 0.9)';
    badgeText = '#EBD5A2';
    dividerColor = '#3B4656';
  }

  const h1 = palette.primaryHue;
  const h2 = palette.secondaryHue;
  const l1 = Math.round(lightRange[0] + prng() * 3);
  const l2 = Math.round(lightRange[1] - prng() * 3);

  const gradientStyle: React.CSSProperties = {
    background: `linear-gradient(${angle}deg, hsl(${h1}, ${sat}%, ${l1}%), hsl(${h2}, ${sat * 0.85}%, ${l2}%))`,
  };

  // Procedural Corner Organic Vector Shapes
  const decorCount = 3 + Math.floor(prng() * 2); // 3 or 4 elements
  const decorElements: React.ReactNode[] = [];

  for (let i = 0; i < decorCount; i++) {
    const isTop = i % 2 === 0;
    const isLeft = i < 2;
    const posX = isLeft ? 15 + prng() * 40 : 260 + prng() * 45;
    const posY = isTop ? 18 + prng() * 45 : 490 + prng() * 55;
    const scale = 0.7 + prng() * 0.6;
    const opacity = 0.25 + prng() * 0.25;
    const rot = Math.round(prng() * 360);

    const shapeType = Math.floor(prng() * 4);

    if (shapeType === 0) {
      // Gentle cloud silhouette
      decorElements.push(
        <path
          key={i}
          d="M10 25 A8 8 0 0 1 24 15 A12 12 0 0 1 45 16 A9 9 0 0 1 54 25 Z"
          fill="currentColor"
          fillOpacity={opacity}
          transform={`translate(${posX}, ${posY}) scale(${scale}) rotate(${rot})`}
        />
      );
    } else if (shapeType === 1) {
      // Star sparkles
      decorElements.push(
        <g
          key={i}
          transform={`translate(${posX}, ${posY}) scale(${scale}) rotate(${rot})`}
          fill="currentColor"
          fillOpacity={opacity + 0.1}
        >
          <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
        </g>
      );
    } else if (shapeType === 2) {
      // Soft organic leaf branch
      decorElements.push(
        <path
          key={i}
          d="M0 20 C10 10 20 5 30 0 C25 15 15 25 0 20 Z M12 12 C18 10 22 6 26 2 C23 11 17 15 12 12 Z"
          fill="currentColor"
          fillOpacity={opacity}
          transform={`translate(${posX}, ${posY}) scale(${scale}) rotate(${rot})`}
        />
      );
    } else {
      // Soft ambient radiant ring
      decorElements.push(
        <circle
          key={i}
          cx={posX}
          cy={posY}
          r={16 * scale}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity={opacity}
        />
      );
    }
  }

  const svgDecorations = (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 568"
      preserveAspectRatio="none"
      style={{ color: tone === 'night' ? '#A2B5CB' : '#A89984' }}
    >
      {decorElements}
    </svg>
  );

  return {
    gradientStyle,
    textColor,
    subTextColor,
    quoteColor,
    stampBorderColor,
    stampTextColor,
    cardBorderColor,
    cardBg,
    curveStroke,
    curveGlow,
    nodeHaloColor,
    nodeBg,
    endNodeHaloColor,
    endNodeBg,
    badgeBg,
    badgeText,
    dividerColor,
    svgDecorations,
    themeIcons: palette.themeIcons,
  };
}

// LocalStorage Helper for user preferences per wish
const STORAGE_PREFIX = 'wish-export-pref-';

export function loadWishCardPreference(wishId: string): WishCardPreference {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${wishId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.seed && parsed.tone && parsed.layout) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading wish card pref:', e);
  }
  // Default fallback
  return {
    seed: hashStringToInt(wishId) || 8888,
    tone: 'afternoon',
    layout: 'balanced',
  };
}

export function saveWishCardPreference(wishId: string, pref: WishCardPreference) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${wishId}`, JSON.stringify(pref));
  } catch (e) {
    console.error('Error saving wish card pref:', e);
  }
}
