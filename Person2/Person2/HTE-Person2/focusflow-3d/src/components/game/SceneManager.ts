import type { MapDefinition, ExitZone } from './MapDefinition';

export class SceneManager {
  currentMapId: string;
  private maps: Record<string, MapDefinition>;

  fadeAlpha = 0;
  private fading = false;
  private fadeDirection: 'out' | 'in' = 'out';
  private readonly fadeSpeed = 0.04;
  private pendingTransition: ExitZone | null = null;
  private onTransitionComplete: ((exit: ExitZone) => void) | null = null;

  constructor(maps: MapDefinition[], startMapId: string) {
    this.maps = {};
    for (const m of maps) {
      this.maps[m.id] = m;
    }
    this.currentMapId = startMapId;
  }

  getCurrentMap(): MapDefinition {
    return this.maps[this.currentMapId];
  }

  isFading(): boolean {
    return this.fading;
  }

  checkExits(playerCol: number, playerRow: number): ExitZone | null {
    const map = this.getCurrentMap();
    for (const exit of map.exits) {
      if (exit.col === playerCol && exit.row === playerRow) {
        return exit;
      }
    }
    return null;
  }

  startTransition(exit: ExitZone, onComplete: (exit: ExitZone) => void): void {
    if (this.fading) return;
    this.fading = true;
    this.fadeDirection = 'out';
    this.fadeAlpha = 0;
    this.pendingTransition = exit;
    this.onTransitionComplete = onComplete;
  }

  /** Returns true while a transition is active (input should be blocked). */
  update(): boolean {
    if (!this.fading) return false;

    if (this.fadeDirection === 'out') {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + this.fadeSpeed);
      if (this.fadeAlpha >= 1) {
        // Fully black — perform the map swap
        if (this.pendingTransition) {
          this.currentMapId = this.pendingTransition.targetMap;
          this.onTransitionComplete?.(this.pendingTransition);
        }
        this.fadeDirection = 'in';
      }
    } else {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - this.fadeSpeed);
      if (this.fadeAlpha <= 0) {
        this.fading = false;
        this.pendingTransition = null;
        this.onTransitionComplete = null;
      }
    }

    return true;
  }

  drawFade(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.fadeAlpha <= 0) return;
    ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}
