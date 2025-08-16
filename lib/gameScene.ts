import Phaser from 'phaser';
import { ComponentType, GameObjectData } from './types';

export class GameScene extends Phaser.Scene {
  private objects: Phaser.GameObjects.Container[] = [];
  private selectedObject: Phaser.GameObjects.Container | null = null;
  private grid: Phaser.GameObjects.Graphics | null = null;
  private gridSize = 32;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private objectSelectCallback?: (object: any) => void;
  
  // State management for undo/redo
  private history: GameObjectData[][] = [];
  private historyIndex = -1;
  private maxHistorySize = 50;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create colored rectangles for different component types
    this.createComponentTextures();
  }

  create() {
    this.createGrid();
    this.setupCameraControls();
    this.setupDropZone();
    this.saveState(); // Initial state
  }

  private createComponentTextures() {
    const graphics = this.add.graphics();
    
    // Create textures for different component types
    const components = [
      { type: 'chair', color: 0x8B4513, width: 64, height: 64 },
      { type: 'table', color: 0xD2691E, width: 96, height: 64 },
      { type: 'sofa', color: 0x4169E1, width: 128, height: 64 },
      { type: 'bed', color: 0x9370DB, width: 128, height: 96 },
      { type: 'wall', color: 0x696969, width: 32, height: 128 },
      { type: 'door', color: 0xA0522D, width: 32, height: 96 },
      { type: 'window', color: 0x87CEEB, width: 64, height: 32 },
      { type: 'plant', color: 0x228B22, width: 48, height: 64 },
      { type: 'lamp', color: 0xFFD700, width: 32, height: 96 },
      { type: 'bookshelf', color: 0x8B4513, width: 64, height: 128 },
    ];

    components.forEach(({ type, color, width, height }) => {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillRoundedRect(0, 0, width, height, 8);
      graphics.lineStyle(2, 0x000000, 0.5);
      graphics.strokeRoundedRect(0, 0, width, height, 8);
      graphics.generateTexture(type, width, height);
    });

    graphics.destroy();
  }

  private createGrid() {
    this.grid = this.add.graphics();
    this.drawGrid();
  }

  private drawGrid() {
    if (!this.grid) return;
    
    this.grid.clear();
    this.grid.lineStyle(1, 0xcccccc, 0.5);

    const camera = this.cameras.main;
    const worldView = camera.worldView;
    
    const startX = Math.floor(worldView.x / this.gridSize) * this.gridSize;
    const startY = Math.floor(worldView.y / this.gridSize) * this.gridSize;
    const endX = worldView.x + worldView.width + this.gridSize;
    const endY = worldView.y + worldView.height + this.gridSize;

    // Draw vertical lines
    for (let x = startX; x < endX; x += this.gridSize) {
      this.grid.moveTo(x, worldView.y);
      this.grid.lineTo(x, worldView.y + worldView.height);
    }

    // Draw horizontal lines
    for (let y = startY; y < endY; y += this.gridSize) {
      this.grid.moveTo(worldView.x, y);
      this.grid.lineTo(worldView.x + worldView.width, y);
    }

    this.grid.strokePath();
  }

  private setupCameraControls() {
    const camera = this.cameras.main;
    
    // Mouse wheel zoom
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      if (deltaY > 0) {
        camera.zoom = Math.max(0.1, camera.zoom - 0.1);
      } else {
        camera.zoom = Math.min(2, camera.zoom + 0.1);
      }
      this.drawGrid();
    });

    // Pan with middle mouse button or shift+drag
    this.input.on('pointerdown', (pointer: any) => {
      if (pointer.middleButtonDown() || (pointer.leftButtonDown() && this.input.keyboard?.addKey('SHIFT').isDown)) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: any) => {
      if (this.isDragging && !this.selectedObject) {
        const deltaX = (pointer.x - this.dragStartX) / camera.zoom;
        const deltaY = (pointer.y - this.dragStartY) / camera.zoom;
        
        camera.scrollX -= deltaX;
        camera.scrollY -= deltaY;
        
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.drawGrid();
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  private setupDropZone() {
    this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
      // This will be called when something is dropped on the scene
    });

    // Make the entire scene a drop zone
    this.add.zone(0, 0, 0, 0).setSize(99999, 99999).setDropZone();
  }

  public addComponent(type: ComponentType, x: number, y: number): Phaser.GameObjects.Container {
    // Snap to grid
    const snappedX = Math.round(x / this.gridSize) * this.gridSize;
    const snappedY = Math.round(y / this.gridSize) * this.gridSize;

    // Create container for the component
    const container = this.add.container(snappedX, snappedY);
    
    // Add the visual sprite
    const sprite = this.add.image(0, 0, type);
    container.add(sprite);
    
    // Store component data
    container.setData('type', type);
    container.setData('id', `${type}_${Date.now()}`);
    container.setData('rotation', 0);
    container.setData('scale', 1);

    // Make interactive
    container.setSize(sprite.width, sprite.height);
    container.setInteractive();
    this.input.setDraggable(container);

    // Add event listeners
    container.on('pointerdown', () => {
      this.selectObject(container);
    });

    container.on('drag', (pointer: any, dragX: number, dragY: number) => {
      const snappedDragX = Math.round(dragX / this.gridSize) * this.gridSize;
      const snappedDragY = Math.round(dragY / this.gridSize) * this.gridSize;
      container.x = snappedDragX;
      container.y = snappedDragY;
    });

    container.on('dragend', () => {
      this.saveState();
    });

    this.objects.push(container);
    this.selectObject(container);
    this.saveState();
    
    return container;
  }

  public selectObject(object: Phaser.GameObjects.Container | null) {
    // Remove selection from previous object
    if (this.selectedObject) {
      const prevSprite = this.selectedObject.list[0] as Phaser.GameObjects.Image;
      prevSprite.setTint(0xffffff);
    }

    this.selectedObject = object;

    if (object) {
      // Add selection tint
      const sprite = object.list[0] as Phaser.GameObjects.Image;
      sprite.setTint(0x00ff00);
    }

    // Notify the React component
    if (this.objectSelectCallback) {
      this.objectSelectCallback(object ? {
        id: object.getData('id'),
        type: object.getData('type'),
        x: object.x,
        y: object.y,
        rotation: object.getData('rotation') || 0,
        scale: object.getData('scale') || 1,
      } : null);
    }
  }

  public deleteSelectedObject() {
    if (!this.selectedObject) return;

    const index = this.objects.indexOf(this.selectedObject);
    if (index > -1) {
      this.objects.splice(index, 1);
    }

    this.selectedObject.destroy();
    this.selectObject(null);
    this.saveState();
  }

  public rotateSelectedObject(angle: number) {
    if (!this.selectedObject) return;

    this.selectedObject.rotation += angle;
    this.selectedObject.setData('rotation', this.selectedObject.rotation);
    this.saveState();
  }

  public scaleSelectedObject(factor: number) {
    if (!this.selectedObject) return;

    const newScale = Math.max(0.1, Math.min(3, this.selectedObject.scale * factor));
    this.selectedObject.setScale(newScale);
    this.selectedObject.setData('scale', newScale);
    this.saveState();
  }

  public setObjectSelectCallback(callback: (object: any) => void) {
    this.objectSelectCallback = callback;
  }

  // State management methods
  private saveState() {
    const state = this.objects.map(obj => ({
      id: obj.getData('id'),
      type: obj.getData('type'),
      x: obj.x,
      y: obj.y,
      rotation: obj.getData('rotation') || 0,
      scale: obj.getData('scale') || 1,
    }));

    // Remove any states after current index (for redo functionality)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new state
    this.history.push(state);
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }

    this.events.emit('stateChanged');
  }

  public undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
      this.events.emit('stateChanged');
    }
  }

  public redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
      this.events.emit('stateChanged');
    }
  }

  public canUndo(): boolean {
    return this.historyIndex > 0;
  }

  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  private loadState(state: GameObjectData[]) {
    // Clear existing objects
    this.objects.forEach(obj => obj.destroy());
    this.objects = [];
    this.selectObject(null);

    // Recreate objects from state
    state.forEach(data => {
      const container = this.add.container(data.x, data.y);
      const sprite = this.add.image(0, 0, data.type);
      container.add(sprite);
      
      container.setData('type', data.type);
      container.setData('id', data.id);
      container.setData('rotation', data.rotation);
      container.setData('scale', data.scale);
      
      container.rotation = data.rotation;
      container.setScale(data.scale);
      
      container.setSize(sprite.width, sprite.height);
      container.setInteractive();
      this.input.setDraggable(container);

      container.on('pointerdown', () => {
        this.selectObject(container);
      });

      container.on('drag', (pointer: any, dragX: number, dragY: number) => {
        const snappedDragX = Math.round(dragX / this.gridSize) * this.gridSize;
        const snappedDragY = Math.round(dragY / this.gridSize) * this.gridSize;
        container.x = snappedDragX;
        container.y = snappedDragY;
      });

      container.on('dragend', () => {
        this.saveState();
      });

      this.objects.push(container);
    });
  }

  public saveWorkspace(): string {
    const currentState = this.history[this.historyIndex] || [];
    return JSON.stringify(currentState);
  }

  public loadWorkspace(data: string) {
    try {
      const state = JSON.parse(data);
      this.loadState(state);
      
      // Reset history
      this.history = [state];
      this.historyIndex = 0;
      this.events.emit('stateChanged');
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  }

  public clearWorkspace() {
    this.objects.forEach(obj => obj.destroy());
    this.objects = [];
    this.selectObject(null);
    this.history = [[]];
    this.historyIndex = 0;
    this.events.emit('stateChanged');
  }
}