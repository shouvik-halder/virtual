'use client';

import { useState, useEffect } from 'react';
import { GameScene } from '@/lib/gameScene';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

interface PropertyPanelProps {
  selectedObject: any;
  gameScene: GameScene | null;
}

export function PropertyPanel({ selectedObject, gameScene }: PropertyPanelProps) {
  const [localRotation, setLocalRotation] = useState(0);
  const [localScale, setLocalScale] = useState(1);
  const [localX, setLocalX] = useState(0);
  const [localY, setLocalY] = useState(0);

  useEffect(() => {
    if (selectedObject) {
      setLocalRotation(selectedObject.rotation || 0);
      setLocalScale(selectedObject.scale || 1);
      setLocalX(selectedObject.x || 0);
      setLocalY(selectedObject.y || 0);
    }
  }, [selectedObject]);

  const handleRotate = (angle: number) => {
    if (gameScene) {
      gameScene.rotateSelectedObject(angle);
    }
  };

  const handleScale = (factor: number) => {
    if (gameScene) {
      gameScene.scaleSelectedObject(factor);
    }
  };

  const handleDelete = () => {
    if (gameScene) {
      gameScene.deleteSelectedObject();
    }
  };

  if (!selectedObject) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700 mb-2">No Object Selected</h3>
          <p className="text-sm text-gray-500">Click on an object in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        <p className="text-sm text-gray-600">Edit selected object</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Object Info */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Object Info</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{selectedObject.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono text-xs">{selectedObject.id?.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Position */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Position</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pos-x">X</Label>
              <Input
                id="pos-x"
                type="number"
                value={Math.round(localX)}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pos-y">Y</Label>
              <Input
                id="pos-y"
                type="number"
                value={Math.round(localY)}
                readOnly
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rotation */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Rotation</h3>
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(-Math.PI / 2)}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              90° Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(Math.PI / 2)}
              className="flex-1"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              90° Right
            </Button>
          </div>
          <div>
            <Label htmlFor="rotation">Degrees</Label>
            <Input
              id="rotation"
              type="number"
              value={Math.round((localRotation * 180) / Math.PI)}
              readOnly
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Scale */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Scale</h3>
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScale(0.9)}
              className="flex-1"
            >
              <ZoomOut className="w-4 h-4 mr-1" />
              Smaller
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScale(1.1)}
              className="flex-1"
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              Larger
            </Button>
          </div>
          <div>
            <Label htmlFor="scale">Scale Factor</Label>
            <Input
              id="scale"
              type="number"
              value={localScale.toFixed(2)}
              readOnly
              step="0.1"
              min="0.1"
              max="3"
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Actions</h3>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Object
          </Button>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}