import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Wish } from '../types';
import { WishCard3D } from './WishCard3D';
import { calculate3DPositions } from '../services/storage';
import { Plus, Move, Sparkles } from 'lucide-react';

interface WishWall3DProps {
  wishes: Wish[];
  onSelectWish: (wish: Wish) => void;
  onOpenAddWish: () => void;
  onGoToCompleted: () => void;
  completedCount: number;
}

export const WishWall3D: React.FC<WishWall3DProps> = ({
  wishes,
  onSelectWish,
  onOpenAddWish,
  onGoToCompleted,
  completedCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState<number>(-8);
  const [rotY, setRotY] = useState<number>(15);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Velocity and physics state in refs for zero-lag 60fps gesture handling
  const stateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
    rotX: -8,
    rotY: 15,
    animId: 0,
  });

  // Calculate 3D sphere positions for each wish
  const positions = calculate3DPositions(wishes.length, 280);

  // Smooth inertial animation loop
  const startInertia = useCallback(() => {
    cancelAnimationFrame(stateRef.current.animId);

    const step = () => {
      if (stateRef.current.isDown) return;

      const friction = 0.93;
      stateRef.current.vx *= friction;
      stateRef.current.vy *= friction;

      // Apply subtle ambient auto-drift when user is idle
      const ambientSpeed = 0.04;
      const currentVx =
        Math.abs(stateRef.current.vx) < 0.03
          ? ambientSpeed
          : stateRef.current.vx;

      stateRef.current.rotY += currentVx;
      stateRef.current.rotX = Math.max(
        -55,
        Math.min(55, stateRef.current.rotX - stateRef.current.vy)
      );

      setRotY(stateRef.current.rotY);
      setRotX(stateRef.current.rotX);

      stateRef.current.animId = requestAnimationFrame(step);
    };

    stateRef.current.animId = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    startInertia();
    return () => cancelAnimationFrame(stateRef.current.animId);
  }, [startInertia]);

  // Pointer event handlers (supports both touch and mouse transparently)
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDown = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    stateRef.current.vx = 0;
    stateRef.current.vy = 0;
    setIsInteracting(true);
    setHasInteracted(true);
    cancelAnimationFrame(stateRef.current.animId);

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stateRef.current.isDown) return;

    const dx = e.clientX - stateRef.current.lastX;
    const dy = e.clientY - stateRef.current.lastY;

    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;

    const sensitivity = 0.35;
    stateRef.current.vx = dx * sensitivity;
    stateRef.current.vy = dy * sensitivity;

    stateRef.current.rotY += stateRef.current.vx;
    stateRef.current.rotX = Math.max(
      -55,
      Math.min(55, stateRef.current.rotX - stateRef.current.vy)
    );

    setRotY(stateRef.current.rotY);
    setRotX(stateRef.current.rotX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!stateRef.current.isDown) return;
    stateRef.current.isDown = false;
    setIsInteracting(false);

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }

    startInertia();
  };

  const handleCardClick = (wish: Wish) => {
    setSelectedWishId(wish.id);
    // Smooth delay for fly-in transition
    setTimeout(() => {
      onSelectWish(wish);
      setSelectedWishId(null);
    }, 240);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-[calc(100vh-62px)] overflow-hidden perspective-container cursor-grab active:cursor-grabbing bg-radial from-[#FAF7F0] via-[#F5EFE4] to-[#ECE3D2]"
    >
      {/* Background Ambience: Subtle floating natural orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      {/* Floating Guidance Pill */}
      {!hasInteracted && wishes.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A4036]/80 text-[#FDFBF7] text-xs shadow-lg backdrop-blur-sm">
            <Move className="w-3.5 h-3.5 animate-pulse" />
            <span>手指拖拽旋转3D空间，点击便签看进展</span>
          </div>
        </div>
      )}

      {/* Top Quick Status Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-[#FFFDF9]/90 border border-[#E8DEC9] text-xs text-[#6B5C4D] shadow-xs backdrop-blur-md font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#5B8EA6] animate-pulse" />
          <span>正在进行 {wishes.length} 个心愿</span>
        </div>
      </div>

      {/* Empty State */}
      {wishes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-20 h-20 rounded-3xl bg-[#FFFDF9] border border-[#E9DFCB] shadow-md flex items-center justify-center text-4xl mb-4">
            🌱
          </div>
          <h2 className="text-xl font-bold text-[#42382E] mb-2">许愿墙空空如也呢</h2>
          <p className="text-sm text-[#827464] max-w-sm mb-6">
            一家人坐下来，聊聊最近有什么想一起实现的心愿吧！可以是一次户外探险，也可以是一个小技能。
          </p>
          <button
            onClick={onOpenAddWish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4E8199] hover:bg-[#447287] active:scale-95 text-white text-sm font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>许下第一个家庭心愿</span>
          </button>
        </div>
      )}

      {/* 3D Scene Space Center */}
      <div
        className="absolute top-1/2 left-1/2 preserve-3d-scene"
        style={{
          transform: `translate3d(-50%, -50%, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: isInteracting ? 'none' : 'transform 0.1s linear',
        }}
      >
        {/* Core anchor center sphere ring */}
        <div className="absolute w-2 h-2 rounded-full bg-amber-200/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* 3D Floating Wish Cards */}
        {wishes.map((wish, index) => {
          const pos = positions[index] || { x: 0, y: 0, z: 0, rx: 0, ry: 0 };

          // Math for relative Z depth given current rotation
          const radY = (rotY * Math.PI) / 180;
          const radX = (rotX * Math.PI) / 180;

          const x1 = pos.x * Math.cos(radY) + pos.z * Math.sin(radY);
          const z1 = -pos.x * Math.sin(radY) + pos.z * Math.cos(radY);
          const y2 = pos.y * Math.cos(radX) - z1 * Math.sin(radX);
          const z2 = pos.y * Math.sin(radX) + z1 * Math.cos(radX);

          const isSelected = selectedWishId === wish.id;

          return (
            <div
              key={wish.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 transform-gpu"
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${pos.ry || 0}deg) rotateX(${pos.rx || 0}deg)`,
                zIndex: isSelected ? 999 : Math.round(z2 + 500),
              }}
            >
              <WishCard3D
                wish={wish}
                isCompleted={false}
                relativeZ={z2}
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
