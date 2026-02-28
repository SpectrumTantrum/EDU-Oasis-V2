import { TILE_SIZE, PLAYER_SPEED, DIRECTION_INDEX, type Direction } from '@/lib/constants';
import { SpriteSheet } from './SpriteSheet';
import type { Camera } from './Camera';
import type { TileMap } from './TileMap';
import type { NPC } from './NPC';

export interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Player {
  x: number;
  y: number;
  width = TILE_SIZE;
  height = TILE_SIZE;
  direction: Direction = 'down';
  isMoving = false;
  private sprite: SpriteSheet | null = null;

  private animFrame = 0;
  private animTimer = 0;
  private readonly animSpeed = 8; // frames between animation ticks

  readonly color = '#4080c0';
  readonly label = 'You';

  constructor(startCol: number, startRow: number) {
    this.x = startCol * TILE_SIZE;
    this.y = startRow * TILE_SIZE;
  }

  setSprite(sprite: SpriteSheet): void {
    this.sprite = sprite;
  }

  update(keys: KeyState, tileMap: TileMap, npcs: NPC[]): void {
    let dx = 0;
    let dy = 0;

    if (keys.left) dx -= PLAYER_SPEED;
    if (keys.right) dx += PLAYER_SPEED;
    if (keys.up) dy -= PLAYER_SPEED;
    if (keys.down) dy += PLAYER_SPEED;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / len) * PLAYER_SPEED;
      dy = (dy / len) * PLAYER_SPEED;
    }

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      // Set facing direction (prioritize last pressed axis)
      if (Math.abs(dx) >= Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      // Try X movement
      const nextX = this.x + dx;
      if (
        tileMap.isWalkablePixel(nextX, this.y, this.width, this.height) &&
        !this.collidesWithNPCs(nextX, this.y, npcs)
      ) {
        this.x = nextX;
      }

      // Try Y movement
      const nextY = this.y + dy;
      if (
        tileMap.isWalkablePixel(this.x, nextY, this.width, this.height) &&
        !this.collidesWithNPCs(this.x, nextY, npcs)
      ) {
        this.y = nextY;
      }

      // Walk animation
      this.animTimer++;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  private collidesWithNPCs(x: number, y: number, npcs: NPC[]): boolean {
    const margin = 4;
    const pLeft = x + margin;
    const pRight = x + this.width - margin;
    const pTop = y + margin;
    const pBottom = y + this.height - margin;

    for (const npc of npcs) {
      const b = npc.getBounds();
      if (pLeft < b.x + b.w && pRight > b.x && pTop < b.y + b.h && pBottom > b.y) {
        return true;
      }
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    if (this.sprite?.isReady()) {
      const dirRow = DIRECTION_INDEX[this.direction];
      this.sprite.drawFrame(ctx, this.animFrame, dirRow, drawX, drawY);
    } else {
      // Idle bob effect
      const bob = this.isMoving ? 0 : Math.sin(Date.now() / 400) * 1;
      SpriteSheet.drawPlaceholder(
        ctx,
        drawX,
        drawY + bob,
        this.color,
        this.label,
        DIRECTION_INDEX[this.direction],
      );

      // Skin-colored head
      ctx.fillStyle = '#f0c080';
      ctx.fillRect(drawX + 10, drawY + 2, 12, 10);
      ctx.strokeStyle = '#202020';
      ctx.strokeRect(drawX + 10, drawY + 2, 12, 10);
    }
  }
}
