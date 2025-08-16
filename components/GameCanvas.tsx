'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/lib/gameScene';

interface GameCanvasProps {
  onObjectSelect: (object: any) => void;
  onSceneReady: (scene: GameScene) => void;
}

export default function GameCanvas({ onObjectSelect, onSceneReady }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Get the scene instance and set up event listeners
    gameRef.current.events.on('ready', () => {
      const scene = gameRef.current?.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.setObjectSelectCallback(onObjectSelect);
        onSceneReady(scene);
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onObjectSelect, onSceneReady]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    />
  );
}