'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { PropertyPanel } from '@/components/PropertyPanel';
import { Toolbar } from '@/components/Toolbar';
import { GameScene } from '@/lib/gameScene';

// Dynamically import the canvas to avoid SSR issues
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
});

export default function Home() {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [gameScene, setGameScene] = useState<GameScene | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleObjectSelect = (object: any) => {
    setSelectedObject(object);
  };

  const handleSceneReady = (scene: GameScene) => {
    setGameScene(scene);
    // Listen for state changes to update undo/redo buttons
    scene.events.on('stateChanged', () => {
      setCanUndo(scene.canUndo());
      setCanRedo(scene.canRedo());
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <Toolbar 
        gameScene={gameScene}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar gameScene={gameScene} />
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-white border-l border-r border-gray-200">
          <GameCanvas 
            onObjectSelect={handleObjectSelect}
            onSceneReady={handleSceneReady}
          />
        </div>

        {/* Property Panel */}
        <PropertyPanel 
          selectedObject={selectedObject} 
          gameScene={gameScene}
        />
      </div>
    </div>
  );
}