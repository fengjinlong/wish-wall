import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Wish } from '../types';
import { WishCard3D } from './WishCard3D';
import { calculate3DPositions } from '../services/storage';
import { Trophy, Compass } from 'lucide-react';
import { sound } from '../utils/sound';

interface CompletedWall3DProps {
  wishes: Wish[];
  onSelectWish: (wish: Wish) => void;
  onBackToWishWall: () => void;
}

export const CompletedWall3D: React.FC<CompletedWall3DProps> = ({
  wishes,
  onSelectWish,
  onBackToWishWall,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  const physicsRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
    rotX: -5,
    rotY: 20,
    animId: 0,
  });

  const positions = calculate3DPositions(wishes.length, 280);

  const applyTransform = useCallback((rx: number, ry: number) => {
    if (sceneRef.current) {
      sceneRef.current.style.transform = `translate3d(-50%, -50%, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;
      const p = physicsRef.current;

      if (!p.isDown) {
        p.vx *= 0.92;
        p.vy *= 0.92;

        const currentVx = Math.abs(p.vx) < 0.02 ? 0.025 : p.vx;

        p.rotY = (p.rotY + currentVx) % 360;
        p.rotX = Math.max(-50, Math.min(50, p.rotX - p.vy));

        applyTransform(p.rotX, p.rotY);
      }

      p.animId = requestAnimationFrame(tick);
    };

    physicsRef.current.animId = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(physicsRef.current.animId);
    };
  }, [applyTransform]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const p = physicsRef.current;
    p.isDown = true;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.lastX = e.clientX;
    p.lastY = e.clientY;
    p.vx = 0;
    p.vy = 0;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const p = physicsRef.current;
    if (!p.isDown) return;

    const dx = e.clientX - p.lastX;
    const dy = e.clientY - p.lastY;

    p.lastX = e.clientX;
    p.lastY = e.clientY;

    const sensitivity = 0.35;
    p.vx = dx * sensitivity;
    p.vy = dy * sensitivity;

    p.rotY = (p.rotY + p.vx) % 360;
    p.rotX = Math.max(-50, Math.min(50, p.rotX - p.vy));

    applyTransform(p.rotX, p.rotY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const p = physicsRef.current;
    if (!p.isDown) return;
    p.isDown = false;

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleCardClick = (wish: Wish) => {
    sound.playPop();
    setSelectedWishId(wish.id);
    setTimeout(() => {
      onSelectWish(wish);
      setSelectedWishId(null);
    }, 200);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full overflow-hidden perspective-container cursor-grab active:cursor-grabbing bg-radial from-[#FBF5E6] via-[#F6EDE0] to-[#E8DCBF]"
    >
      {/* Golden Twinkling Sparkles Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/6 left-1/4 w-80 h-80 rounded-full bg-amber-200/50 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-yellow-100/30 blur-3xl" />
      </div>

      {/* Floating Stardust particles */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute top-[20%] left-[15%] text-amber-400 text-sm animate-ping">✦</span>
        <span className="absolute top-[35%] right-[20%] text-amber-300 text-base animate-pulse">✨</span>
        <span className="absolute bottom-[25%] left-[25%] text-amber-400 text-xs animate-bounce">★</span>
        <span className="absolute top-[65%] right-[30%] text-amber-400 text-sm animate-pulse">✦</span>
      </div>

      {/* Top Status & Switch */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-[#FFFDF6]/95 border border-[#E8D49E] text-xs text-[#8C6A23] shadow-xs backdrop-blur-md font-semibold flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-[#D4A346]" />
          <span>家庭荣誉纪念册 · 已实现 {wishes.length} 个心愿</span>
        </div>
      </div>

      {/* Empty State */}
      {wishes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-20 h-20 rounded-3xl bg-[#FFFDF6] border border-[#EAD7A6] shadow-md flex items-center justify-center text-4xl mb-4 text-[#D4A346]">
            🏆
          </div>
          <h2 className="text-xl font-bold text-[#4A3D28] mb-2">还没有心愿“搬家”过来呢</h2>
          <p className="text-sm text-[#87755D] max-w-sm mb-6">
            在许愿墙里记录迈出的每一步，当心愿达成时点击“心愿实现啦”，就能在这里永久珍藏！
          </p>
          <button
            onClick={() => {
              sound.playTap();
              onBackToWishWall();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D4A346] hover:bg-[#C29339] active:scale-95 text-white text-sm font-semibold shadow-md transition-all"
          >
            <Compass className="w-4 h-4 stroke-[2.5]" />
            <span>返回许愿墙</span>
          </button>
        </div>
      )}

      {/* 3D Scene Space Center */}
      <div
        ref={sceneRef}
        className="absolute top-1/2 left-1/2 preserve-3d-scene"
        style={{
          transform: 'translate3d(-50%, -50%, 0) rotateX(-5deg) rotateY(20deg)',
          transition: 'none',
        }}
      >
        {/* Core glowing ring */}
        <div className="absolute w-2 h-2 rounded-full bg-amber-400/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* 3D Floating Completed Cards */}
        {wishes.map((wish, index) => {
          const pos = positions[index] || { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
          const isSelected = selectedWishId === wish.id;

          return (
            <div
              key={wish.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu"
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${pos.ry || 0}deg) rotateX(${pos.rx || 0}deg)`,
              }}
            >
              <WishCard3D
                wish={wish}
                isCompleted={true}
                isSelected={isSelected}
                onClick={() => handleCardClick(wish)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
