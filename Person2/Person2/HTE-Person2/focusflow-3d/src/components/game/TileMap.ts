import { TILE_SIZE, TILE_COLORS } from '@/lib/constants';
import type { Camera } from './Camera';
import type { MapDefinition, MapLabel } from './MapDefinition';

// 0=floor, 1=wall, 2=desk, 3=whiteboard, 4=bookshelf,
// 5=lab bench, 6=quiz board, 7=window, 8=door, 9=teacher desk
// 10=grass, 11=path/dirt, 12=pond/water, 13=tree, 14=roof, 15=fence
const WALKABLE_TILES = new Set([0, 2, 8, 10, 11]);

const FURNITURE_LABELS: Record<number, string> = {
  2: 'Desk',
  3: 'Board',
  4: 'Books',
  5: 'Lab',
  6: 'Quiz',
  7: 'Window',
  8: 'Door',
  9: 'Tutor',
};

export class TileMap {
  readonly cols: number;
  readonly rows: number;
  private groundMap: number[][];
  private furnitureMap: number[][];
  private labels: MapLabel[];
  private groundCache: OffscreenCanvas | null = null;

  constructor(mapDef: MapDefinition) {
    this.cols = mapDef.cols;
    this.rows = mapDef.rows;
    this.groundMap = mapDef.groundMap;
    this.furnitureMap = mapDef.furnitureMap;
    this.labels = mapDef.labels ?? [];
  }

  isWalkable(col: number, row: number): boolean {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    const ground = this.groundMap[row][col];
    if (!WALKABLE_TILES.has(ground)) return false;
    const furn = this.furnitureMap[row][col];
    if (furn !== 0 && !WALKABLE_TILES.has(furn)) return false;
    return true;
  }

  isWalkablePixel(x: number, y: number, width: number, height: number): boolean {
    const margin = 4;
    const left = x + margin;
    const right = x + width - margin;
    const top = y + margin;
    const bottom = y + height - margin;

    const colL = Math.floor(left / TILE_SIZE);
    const colR = Math.floor(right / TILE_SIZE);
    const rowT = Math.floor(top / TILE_SIZE);
    const rowB = Math.floor(bottom / TILE_SIZE);

    for (let r = rowT; r <= rowB; r++) {
      for (let c = colL; c <= colR; c++) {
        if (!this.isWalkable(c, r)) return false;
      }
    }
    return true;
  }

  getTileAt(col: number, row: number): { ground: number; furniture: number } {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return { ground: 1, furniture: 0 };
    }
    return { ground: this.groundMap[row][col], furniture: this.furnitureMap[row][col] };
  }

  invalidateCache(): void {
    this.groundCache = null;
  }

  drawGround(ctx: CanvasRenderingContext2D, camera: Camera, masteryTint?: number): void {
    if (!this.groundCache) {
      this.groundCache = new OffscreenCanvas(this.cols * TILE_SIZE, this.rows * TILE_SIZE);
      const offCtx = this.groundCache.getContext('2d')!;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const tile = this.groundMap[r][c];
          offCtx.fillStyle = TILE_COLORS[tile] ?? '#ff00ff';
          offCtx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          offCtx.strokeStyle = 'rgba(0,0,0,0.05)';
          offCtx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
    ctx.drawImage(this.groundCache, -camera.x, -camera.y);

    if (masteryTint !== undefined) {
      const tintColor =
        masteryTint >= 70 ? 'rgba(80,176,80,0.15)' :
        masteryTint >= 40 ? 'rgba(224,192,48,0.15)' :
                            'rgba(224,80,80,0.15)';
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.furnitureMap[r][c] === 3) {
            ctx.fillStyle = tintColor;
            ctx.fillRect(c * TILE_SIZE - camera.x, r * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }

  drawFurniture(ctx: CanvasRenderingContext2D, camera: Camera, masteryTint?: number): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const furn = this.furnitureMap[r][c];
        if (furn === 0) continue;

        const dx = c * TILE_SIZE - camera.x;
        const dy = r * TILE_SIZE - camera.y;

        let color = TILE_COLORS[furn] ?? '#ff00ff';
        if (furn === 7 && masteryTint !== undefined) {
          color = masteryTint >= 70 ? '#ffe880' : masteryTint >= 40 ? '#c0d8e8' : '#8898a8';
        }

        ctx.fillStyle = color;
        ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx + 0.5, dy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

        const label = FURNITURE_LABELS[furn];
        if (label) {
          ctx.fillStyle = '#202020';
          ctx.font = '7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(label, dx + TILE_SIZE / 2, dy + TILE_SIZE / 2 + 2);
        }
      }
    }
  }

  drawDoorLock(ctx: CanvasRenderingContext2D, camera: Camera, isLocked: boolean): void {
    if (!isLocked) return;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.furnitureMap[r][c] !== 8) continue;
        const dx = c * TILE_SIZE - camera.x;
        const dy = r * TILE_SIZE - camera.y;
        ctx.fillStyle = 'rgba(200,50,50,0.6)';
        ctx.fillRect(dx + 8, dy + 4, 16, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', dx + TILE_SIZE / 2, dy + TILE_SIZE / 2 + 5);
      }
    }
  }

  drawLabels(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.labels.length === 0) return;
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const label of this.labels) {
      const x = label.col * TILE_SIZE + TILE_SIZE / 2 - camera.x;
      const y = label.row * TILE_SIZE + TILE_SIZE / 2 - camera.y;
      const metrics = ctx.measureText(label.text);
      const pw = 6;
      const ph = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(x - metrics.width / 2 - pw, y - 7 - ph, metrics.width + pw * 2, 14 + ph * 2, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label.text, x, y);
    }
    ctx.restore();
  }
}
