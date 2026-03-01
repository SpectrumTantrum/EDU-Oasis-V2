import { TILE_SIZE } from '@/lib/constants';

export class SpriteSheet {
  private image: HTMLImageElement | null = null;
  private loaded = false;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly margin: number;

  constructor(
    src?: string,
    frameWidth = TILE_SIZE,
    frameHeight = TILE_SIZE,
    margin = 0,
  ) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.margin = margin;

    if (src) {
      this.image = new Image();
      this.image.onload = () => { this.loaded = true; };
      this.image.src = src;
    }
  }

  isReady(): boolean {
    return this.loaded && this.image !== null;
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameCol: number,
    frameRow: number,
    destX: number,
    destY: number,
    destW = this.frameWidth,
    destH = this.frameHeight,
  ): void {
    if (!this.image || !this.loaded) return;
    const stride = this.frameWidth + this.margin;
    ctx.drawImage(
      this.image,
      frameCol * stride,
      frameRow * stride,
      this.frameWidth,
      this.frameHeight,
      destX,
      destY,
      destW,
      destH,
    );
  }

  static drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    label: string,
    direction?: number,
  ): void {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

    // Outline
    ctx.strokeStyle = '#202020';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

    // Direction indicator (small triangle showing facing direction)
    if (direction !== undefined) {
      ctx.fillStyle = '#fff';
      const cx = x + TILE_SIZE / 2;
      const cy = y + TILE_SIZE / 2;
      ctx.beginPath();
      switch (direction) {
        case 0: // down
          ctx.moveTo(cx - 3, cy + 2);
          ctx.lineTo(cx + 3, cy + 2);
          ctx.lineTo(cx, cy + 7);
          break;
        case 1: // left
          ctx.moveTo(cx - 2, cy - 3);
          ctx.lineTo(cx - 2, cy + 3);
          ctx.lineTo(cx - 7, cy);
          break;
        case 2: // right
          ctx.moveTo(cx + 2, cy - 3);
          ctx.lineTo(cx + 2, cy + 3);
          ctx.lineTo(cx + 7, cy);
          break;
        case 3: // up
          ctx.moveTo(cx - 3, cy - 2);
          ctx.lineTo(cx + 3, cy - 2);
          ctx.lineTo(cx, cy - 7);
          break;
      }
      ctx.fill();
    }

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + TILE_SIZE / 2, y + TILE_SIZE - 2);
  }
}
