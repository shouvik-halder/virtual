export type ComponentType = 
  | 'chair' 
  | 'table' 
  | 'sofa' 
  | 'bed' 
  | 'wall' 
  | 'door' 
  | 'window' 
  | 'plant' 
  | 'lamp' 
  | 'bookshelf';

export type ComponentCategory = 'furniture' | 'structural' | 'decorative';

export interface Component {
  type: ComponentType;
  name: string;
  category: ComponentCategory;
  description: string;
}

export interface GameObjectData {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export const COMPONENTS: Component[] = [
  // Furniture
  { type: 'chair', name: 'Chair', category: 'furniture', description: 'Comfortable seating' },
  { type: 'table', name: 'Table', category: 'furniture', description: 'Dining or work surface' },
  { type: 'sofa', name: 'Sofa', category: 'furniture', description: 'Living room seating' },
  { type: 'bed', name: 'Bed', category: 'furniture', description: 'Bedroom furniture' },
  { type: 'bookshelf', name: 'Bookshelf', category: 'furniture', description: 'Storage for books' },
  
  // Structural
  { type: 'wall', name: 'Wall', category: 'structural', description: 'Room divider' },
  { type: 'door', name: 'Door', category: 'structural', description: 'Room entrance' },
  { type: 'window', name: 'Window', category: 'structural', description: 'Natural light source' },
  
  // Decorative
  { type: 'plant', name: 'Plant', category: 'decorative', description: 'Green decoration' },
  { type: 'lamp', name: 'Lamp', category: 'decorative', description: 'Lighting fixture' },
];