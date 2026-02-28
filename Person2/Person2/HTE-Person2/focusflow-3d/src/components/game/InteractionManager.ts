import type { NPC } from './NPC';
import type { Player } from './Player';

export class InteractionManager {
  nearestNPC: NPC | null = null;
  canInteract = false;

  update(player: Player, npcs: NPC[]): void {
    let closest: NPC | null = null;
    let closestDist = Infinity;

    for (const npc of npcs) {
      if (npc.isInRange(player.x, player.y)) {
        const dx = npc.x - player.x;
        const dy = npc.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = npc;
        }
      }
    }

    this.nearestNPC = closest;
    this.canInteract = closest !== null;
  }

  tryInteract(): NPC | null {
    if (!this.canInteract || !this.nearestNPC) return null;
    return this.nearestNPC;
  }

  drawPrompt(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    if (!this.canInteract || !this.nearestNPC) return;

    const text = `Press SPACE to talk to ${this.nearestNPC.name}`;
    ctx.save();
    ctx.fillStyle = 'rgba(32,32,32,0.85)';
    ctx.font = 'bold 10px monospace';
    const metrics = ctx.measureText(text);
    const w = metrics.width + 16;
    const h = 20;
    const x = (canvasWidth - w) / 2;
    const y = 8;

    // Rounded rectangle background
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvasWidth / 2, y + h / 2);
    ctx.restore();
  }
}
