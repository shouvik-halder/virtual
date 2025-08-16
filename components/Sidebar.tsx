'use client';

import { useState } from 'react';
import { Component, COMPONENTS, ComponentCategory } from '@/lib/types';
import { GameScene } from '@/lib/gameScene';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Home, Palette } from 'lucide-react';

interface SidebarProps {
  gameScene: GameScene | null;
}

export function Sidebar({ gameScene }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('furniture');

  const categories = [
    { key: 'furniture' as ComponentCategory, label: 'Furniture', icon: Home },
    { key: 'structural' as ComponentCategory, label: 'Structural', icon: Package },
    { key: 'decorative' as ComponentCategory, label: 'Decorative', icon: Palette },
  ];

  const handleDragStart = (component: Component, event: React.DragEvent) => {
    event.dataTransfer.setData('component', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleComponentClick = (component: Component) => {
    if (gameScene) {
      // Add component at center of camera view
      const camera = gameScene.cameras.main;
      const centerX = camera.scrollX + camera.width / 2;
      const centerY = camera.scrollY + camera.height / 2;
      gameScene.addComponent(component.type, centerX, centerY);
    }
  };

  const getFilteredComponents = (category: ComponentCategory) => {
    return COMPONENTS.filter(component => component.category === category);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        <p className="text-sm text-gray-600">Drag items to canvas or click to add</p>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ComponentCategory)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-4">
          {categories.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {categories.map(({ key }) => (
            <TabsContent key={key} value={key} className="mt-0 p-4 space-y-3">
              {getFilteredComponents(key).map((component) => (
                <ComponentItem
                  key={component.type}
                  component={component}
                  onDragStart={(e) => handleDragStart(component, e)}
                  onClick={() => handleComponentClick(component)}
                />
              ))}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

interface ComponentItemProps {
  component: Component;
  onDragStart: (event: React.DragEvent) => void;
  onClick: () => void;
}

function ComponentItem({ component, onDragStart, onClick }: ComponentItemProps) {
  const getComponentColor = (type: string) => {
    const colors: Record<string, string> = {
      chair: 'bg-amber-100 border-amber-300',
      table: 'bg-orange-100 border-orange-300',
      sofa: 'bg-blue-100 border-blue-300',
      bed: 'bg-purple-100 border-purple-300',
      wall: 'bg-gray-100 border-gray-300',
      door: 'bg-amber-100 border-amber-400',
      window: 'bg-sky-100 border-sky-300',
      plant: 'bg-green-100 border-green-300',
      lamp: 'bg-yellow-100 border-yellow-300',
      bookshelf: 'bg-amber-100 border-amber-300',
    };
    return colors[type] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="flex items-center p-3 rounded-lg border-2 border-dashed cursor-move hover:shadow-md transition-all duration-200 group"
    >
      <div className={`w-12 h-12 rounded-lg border-2 mr-3 flex-shrink-0 ${getComponentColor(component.type)}`}>
        <div className="w-full h-full rounded-md bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 group-hover:text-gray-900">
          {component.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {component.description}
        </p>
      </div>
    </div>
  );
}