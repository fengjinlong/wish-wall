/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wish, Member, MemberId, FamilyData } from './types';
import {
  loadFamilyData,
  saveFamilyData,
  getInitialFamilyData,
} from './services/storage';
import { HeaderNav } from './components/HeaderNav';
import { WishWall3D } from './components/WishWall3D';
import { CompletedWall3D } from './components/CompletedWall3D';
import { WishDetailTimeline } from './components/WishDetailTimeline';
import { AddWishModal } from './components/AddWishModal';
import { AddStepModal } from './components/AddStepModal';
import { CelebrationModal } from './components/CelebrationModal';
import { OnboardingSetup } from './components/OnboardingSetup';

export default function App() {
  const [data, setData] = useState<FamilyData>(() => loadFamilyData());
  const [currentView, setCurrentView] = useState<'wish-wall' | 'completed-wall' | 'detail'>('wish-wall');
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  // Modals state
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [celebrationWish, setCelebrationWish] = useState<Wish | null>(null);

  // Sync to localStorage whenever data changes
  const updateData = (newData: FamilyData) => {
    setData(newData);
    saveFamilyData(newData);
  };

  const inProgressWishes = data.wishes.filter((w) => w.status === '进行中');
  const completedWishes = data.wishes.filter((w) => w.status === '已完成');

  const selectedWish = data.wishes.find((w) => w.id === selectedWishId);

  // Operator switcher
  const handleSetCurrentOperator = (id: MemberId) => {
    updateData({
      ...data,
      currentOperatorId: id,
    });
  };

  // Add new wish
  const handleAddWish = (wishInput: {
    title: string;
    note: string;
    categoryIcon: string;
    decoIcon: string;
    owners: string[];
    createdBy: string;
  }) => {
    const newWish: Wish = {
      id: `wish-${Date.now()}`,
      title: wishInput.title,
      note: wishInput.note,
      categoryIcon: wishInput.categoryIcon,
      decoIcon: wishInput.decoIcon,
      owners: wishInput.owners,
      createdBy: wishInput.createdBy,
      createdAt: new Date().toISOString(),
      status: '进行中',
      completedAt: null,
      position3D: { x: 0, y: 0, z: 0 },
      progressSteps: [],
    };

    const newWishes = [newWish, ...data.wishes];
    updateData({
      ...data,
      wishes: newWishes,
    });
    // Ensure on wish wall view
    setCurrentView('wish-wall');
  };

  // Add new progress step to current wish
  const handleSaveStep = (stepInput: {
    by: string[];
    content: string;
    moodText: string;
    encouragement: string;
  }) => {
    if (!selectedWishId) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const newStep = {
      id: `step-${Date.now()}`,
      date: dateStr,
      by: stepInput.by,
      content: stepInput.content,
      moodText: stepInput.moodText,
      encouragement: stepInput.encouragement,
    };

    const updatedWishes = data.wishes.map((w) => {
      if (w.id === selectedWishId) {
        return {
          ...w,
          progressSteps: [...(w.progressSteps || []), newStep],
        };
      }
      return w;
    });

    updateData({
      ...data,
      wishes: updatedWishes,
    });
  };

  // Mark wish as completed
  const handleCompleteWish = () => {
    if (!selectedWishId) return;

    const targetWish = data.wishes.find((w) => w.id === selectedWishId);
    if (!targetWish) return;

    const completedWish: Wish = {
      ...targetWish,
      status: '已完成',
      completedAt: new Date().toISOString(),
    };

    const updatedWishes = data.wishes.map((w) =>
      w.id === selectedWishId ? completedWish : w
    );

    updateData({
      ...data,
      wishes: updatedWishes,
    });

    // Trigger celebration modal
    setCelebrationWish(completedWish);
  };

  // Select wish to view detail
  const handleSelectWish = (wish: Wish) => {
    setSelectedWishId(wish.id);
    setCurrentView('detail');
  };

  // Return from detail view
  const handleBackFromDetail = () => {
    if (selectedWish?.status === '已完成') {
      setCurrentView('completed-wall');
    } else {
      setCurrentView('wish-wall');
    }
  };

  // Update members
  const handleSaveMembers = (members: Member[]) => {
    updateData({
      ...data,
      members,
      hasCompletedOnboarding: true,
    });
  };

  // Reset demo data
  const handleResetSampleData = () => {
    const initial = getInitialFamilyData();
    updateData(initial);
    setCurrentView('wish-wall');
    setSelectedWishId(null);
  };

  const isDetailView = currentView === 'detail';

  return (
    <div
      className={`${
        isDetailView
          ? 'min-h-screen overflow-y-auto'
          : 'h-screen h-[100dvh] overflow-hidden'
      } bg-[#FAF7F0] text-[#4A4036] flex flex-col font-sans select-none`}
    >
      {/* Navigation Header (Hidden on Timeline Detail to maximize focus) */}
      {!isDetailView && (
        <HeaderNav
          currentView={currentView}
          setCurrentView={(v) => setCurrentView(v)}
          completedCount={completedWishes.length}
          inProgressCount={inProgressWishes.length}
          onOpenAddWish={() => setIsAddWishOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className={`flex-1 relative ${isDetailView ? 'w-full' : 'w-full h-full overflow-hidden'}`}>
        {currentView === 'wish-wall' && (
          <WishWall3D
            wishes={inProgressWishes}
            onSelectWish={handleSelectWish}
            onOpenAddWish={() => setIsAddWishOpen(true)}
            onGoToCompleted={() => setCurrentView('completed-wall')}
            completedCount={completedWishes.length}
          />
        )}

        {currentView === 'completed-wall' && (
          <CompletedWall3D
            wishes={completedWishes}
            onSelectWish={handleSelectWish}
            onBackToWishWall={() => setCurrentView('wish-wall')}
          />
        )}

        {currentView === 'detail' && selectedWish && (
          <WishDetailTimeline
            wish={selectedWish}
            members={data.members}
            onBack={handleBackFromDetail}
            onOpenAddStep={() => setIsAddStepOpen(true)}
            onCompleteWish={handleCompleteWish}
          />
        )}
      </main>

      {/* Modals & Popups */}
      <AddWishModal
        isOpen={isAddWishOpen}
        onClose={() => setIsAddWishOpen(false)}
        members={data.members}
        currentOperatorId={data.currentOperatorId}
        onAddWish={handleAddWish}
      />

      {selectedWish && (
        <AddStepModal
          isOpen={isAddStepOpen}
          onClose={() => setIsAddStepOpen(false)}
          wish={selectedWish}
          members={data.members}
          currentOperatorId={data.currentOperatorId}
          onSaveStep={handleSaveStep}
        />
      )}

      {celebrationWish && (
        <CelebrationModal
          isOpen={Boolean(celebrationWish)}
          wish={celebrationWish}
          members={data.members}
          onGoToCompletedWall={() => {
            setCelebrationWish(null);
            setCurrentView('completed-wall');
          }}
          onStayHere={() => {
            setCelebrationWish(null);
          }}
        />
      )}

      <OnboardingSetup
        isOpen={isSettingsOpen}
        isInitial={false}
        onClose={() => setIsSettingsOpen(false)}
        members={data.members}
        onSaveMembers={handleSaveMembers}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
