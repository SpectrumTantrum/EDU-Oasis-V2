import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '@/lib/constants';

export class Camera {
  x = 0;
  y = 0;

  private mapWidth: number;
  private mapHeight: number;
  private readonly lerpSpeed = 0.08;

  constructor(mapCols: number, mapRows: number) {
    this.mapWidth = mapCols * TILE_SIZE;
    this.mapHeight = mapRows * TILE_SIZE;
  }

  updateBounds(mapCols: number, mapRows: number): void {
    this.mapWidth = mapCols * TILE_SIZE;
    this.mapHeight = mapRows * TILE_SIZE;
  }

  follow(targetX: number, targetY: number): void {
    const targetCamX = targetX - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
    const targetCamY = targetY - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;

    this.x += (targetCamX - this.x) * this.lerpSpeed;
    this.y += (targetCamY - this.y) * this.lerpSpeed;

    this.x = Math.max(0, Math.min(this.x, this.mapWidth - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.mapHeight - CANVAS_HEIGHT));
  }

  snapTo(targetX: number, targetY: number): void {
    this.x = targetX - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
    this.y = targetY - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;
    this.x = Math.max(0, Math.min(this.x, this.mapWidth - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.mapHeight - CANVAS_HEIGHT));
  }
}
