import { TILE_SIZE, INTERACTION_RANGE, DIRECTION_INDEX, type Direction } from '@/lib/constants';
import { SpriteSheet } from './SpriteSheet';
import type { SpriteCoord } from '@/lib/sprite-config';
import type { Camera } from './Camera';

export interface NPCOption {
  label: string;
  panelId: string | null; // null = "never mind" / close dialogue
}

export interface NPCConfig {
  id: string;
  name: string;
  color: string;
  col: number;
  row: number;
  greeting: string;
  options: NPCOption[];
  panelId: string;
  idleLabel?: string;
}

export class NPC {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly greeting: string;
  readonly options: NPCOption[];
  readonly panelId: string;
  readonly idleLabel: string;

  x: number;
  y: number;
  width = TILE_SIZE;
  height = TILE_SIZE;
  direction: Direction = 'down';

  private sprite: SpriteSheet | null = null;
  private spriteCoord: SpriteCoord | null = null;
  private standaloneImage: HTMLImageElement | null = null;
  private standaloneCrop: { sx: number; sy: number; sw: number; sh: number } | null = null;
  private standaloneRenderH = TILE_SIZE;
  private bobOffset = 0;
  private bobTimer = 0;
  private inRange = false;
  private exclamationPulse = 0;

  constructor(config: NPCConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.greeting = config.greeting;
    this.options = config.options;
    this.panelId = config.panelId;
    this.idleLabel = config.idleLabel ?? config.name.slice(0, 4);
    this.x = config.col * TILE_SIZE;
    this.y = config.row * TILE_SIZE;
  }

  setSprite(sprite: SpriteSheet, coord?: SpriteCoord): void {
    this.sprite = sprite;
    if (coord) this.spriteCoord = coord;
  }

  setStandaloneImage(
    src: string,
    crop?: { sx: number; sy: number; sw: number; sh: number },
    renderHeight?: number,
  ): void {
    const img = new Image();
    img.src = src;
    if (crop) this.standaloneCrop = crop;
    if (renderHeight) this.standaloneRenderH = renderHeight;
    img.onload = () => { this.standaloneImage = img; };
  }

  getBounds(): { x: number; y: number; w: number; h: number } {
    return { x: this.x + 2, y: this.y + 2, w: this.width - 4, h: this.height - 4 };
  }

  isInRange(playerX: number, playerY: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const px = playerX + TILE_SIZE / 2;
    const py = playerY + TILE_SIZE / 2;
    const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
    return dist <= INTERACTION_RANGE;
  }

  update(playerX: number, playerY: number, animSpeedMultiplier = 1): void {
    this.inRange = this.isInRange(playerX, playerY);

    // Face the player when in range
    if (this.inRange) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }
    }

    // Idle bob animation
    this.bobTimer += 0.03 * animSpeedMultiplier;
    this.bobOffset = Math.sin(this.bobTimer) * 1.5;

    // Exclamation pulse
    if (this.inRange) {
      this.exclamationPulse = (this.exclamationPulse + 0.05) % (Math.PI * 2);
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, driftMode = false): void {
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y + this.bobOffset);

    if (this.standaloneImage) {
      const crop = this.standaloneCrop;
      const srcX = crop ? crop.sx : 0;
      const srcY = crop ? crop.sy : 0;
      const srcW = crop ? crop.sw : this.standaloneImage.width;
      const srcH = crop ? crop.sh : this.standaloneImage.height;
      const aspect = srcW / srcH;
      const dH = this.standaloneRenderH;
      const dW = dH * aspect;
      const offsetX = (TILE_SIZE - dW) / 2;
      const offsetY = TILE_SIZE - dH;
      ctx.drawImage(
        this.standaloneImage,
        srcX, srcY, srcW, srcH,
        drawX + offsetX, drawY + offsetY, dW, dH,
      );
    } else if (this.sprite?.isReady() && this.spriteCoord) {
      this.sprite.drawFrame(
        ctx,
        this.spriteCoord.col,
        this.spriteCoord.row,
        drawX,
        drawY,
        TILE_SIZE,
        TILE_SIZE,
      );
    } else {
      SpriteSheet.drawPlaceholder(
        ctx,
        drawX,
        drawY,
        this.color,
        this.idleLabel,
        DIRECTION_INDEX[this.direction],
      );
    }

    // "!" indicator when player is in range
    if (this.inRange || driftMode) {
      const pulseScale = this.inRange
        ? 1 + Math.sin(this.exclamationPulse) * 0.2
        : 1 + Math.sin(Date.now() / 200) * 0.3;

      ctx.save();
      ctx.translate(drawX + TILE_SIZE / 2, drawY - 6);
      ctx.scale(pulseScale, pulseScale);

      // Background circle
      ctx.fillStyle = driftMode && !this.inRange ? '#ffaa00' : '#ff4444';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // "!" text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 0);

      ctx.restore();
    }

    // Name tag
    ctx.fillStyle = '#202020';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, drawX + TILE_SIZE / 2, drawY + TILE_SIZE + 8);
  }
}

// ─── NPC Definitions ─────────────────────────────────────────────────────────

export const CLASSROOM_NPCS: NPCConfig[] = [
  {
    id: 'professor-maple',
    name: 'Prof. Maple',
    color: '#8060b0',
    col: 3,
    row: 3,
    panelId: 'study',
    greeting: "Welcome to the whiteboard!\nI can help you visualize concepts\nand build your knowledge map.",
    idleLabel: 'Prof',
    options: [
      { label: 'View concept map', panelId: 'whiteboard' },
      { label: 'Study a concept', panelId: 'study' },
      { label: 'Never mind', panelId: null },
    ],
  },
  {
    id: 'librarian-rex',
    name: 'Librarian Rex',
    color: '#50a050',
    col: 3,
    row: 5,
    panelId: 'bookshelf',
    greeting: "Hello there, fellow scholar!\nI've curated some excellent\nresources for your studies.",
    idleLabel: 'Rex',
    options: [
      { label: 'Browse resources', panelId: 'bookshelf' },
      { label: 'Never mind', panelId: null },
    ],
  },
  {
    id: 'coach-byte',
    name: 'Coach Byte',
    color: '#e07030',
    col: 3,
    row: 11,
    panelId: 'challenge',
    greeting: "Ready for a challenge?\nHands-on practice is the best\nway to build real skills!",
    idleLabel: 'Byte',
    options: [
      { label: 'Start a challenge', panelId: 'challenge' },
      { label: 'Never mind', panelId: null },
    ],
  },
  {
    id: 'quiz-master-pixel',
    name: 'Quiz Pixel',
    color: '#d04040',
    col: 16,
    row: 6,
    panelId: 'quiz',
    greeting: "Time to test your knowledge!\nI'll adapt the difficulty based\non your current mastery level.",
    idleLabel: 'Quiz',
    options: [
      { label: 'Take a quiz', panelId: 'quiz' },
      { label: 'Never mind', panelId: null },
    ],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    color: '#4090b0',
    col: 14,
    row: 10,
    panelId: 'tutor',
    greeting: "Greetings, learner.\nI sense your knowledge state...\nHow can I guide you today?",
    idleLabel: 'Orac',
    options: [
      { label: 'Chat with tutor', panelId: 'tutor' },
      { label: 'What should I do next?', panelId: 'tutor' },
      { label: 'Never mind', panelId: null },
    ],
  },
  {
    id: 'nurse-joy',
    name: 'Nurse Joy',
    color: '#e07090',
    col: 16,
    row: 2,
    panelId: 'progress',
    greeting: "How are you feeling?\nLet me check your progress\nand see how you're doing!",
    idleLabel: 'Joy',
    options: [
      { label: 'View my progress', panelId: 'progress' },
      { label: 'How are you feeling?', panelId: 'cognitive-checkin' },
      { label: 'Upload material', panelId: 'upload' },
      { label: 'Never mind', panelId: null },
    ],
  },
];
