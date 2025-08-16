'use client';

import { GameScene } from '@/lib/gameScene';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Undo, Redo, Save, FolderOpen, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ToolbarProps {
  gameScene: GameScene | null;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({ gameScene, canUndo, canRedo }: ToolbarProps) {
  const handleUndo = () => {
    if (gameScene && canUndo) {
      gameScene.undo();
    }
  };

  const handleRedo = () => {
    if (gameScene && canRedo) {
      gameScene.redo();
    }
  };

  const handleSave = () => {
    if (gameScene) {
      const data = gameScene.saveWorkspace();
      localStorage.setItem('virtualSpaceDesign', data);
      // You could also trigger a download here
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workspace.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleLoad = () => {
    if (gameScene) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result as string;
            gameScene.loadWorkspace(data);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const handleClear = () => {
    if (gameScene && confirm('Are you sure you want to clear the workspace?')) {
      gameScene.clearWorkspace();
    }
  };

  const handleZoomIn = () => {
    if (gameScene && gameScene.cameras && gameScene.cameras.main) {
      const camera = gameScene.cameras.main;
      camera.zoom = Math.min(2, camera.zoom + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (gameScene && gameScene.cameras && gameScene.cameras.main) {
      const camera = gameScene.cameras.main;
      camera.zoom = Math.max(0.1, camera.zoom - 0.1);
    }
  };

  const handleResetView = () => {
    if (gameScene && gameScene.cameras && gameScene.cameras.main) {
      const camera = gameScene.cameras.main;
      camera.zoom = 1;
      camera.centerOn(0, 0);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleLoad}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetView}>
            Reset View
          </Button>
        </div>

        <div className="ml-auto">
          <span className="text-sm text-gray-600">
            Virtual Space Designer
          </span>
        </div>
      </div>
    </div>
  );
}