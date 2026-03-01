'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '@/lib/constants';
import { TileMap } from './TileMap';
import { SpriteSheet } from './SpriteSheet';
import { Camera } from './Camera';
import { Player, type KeyState } from './Player';
import { NPC, CLASSROOM_NPCS } from './NPC';
import { InteractionManager } from './InteractionManager';
import { SceneManager } from './SceneManager';
import { CLASSROOM_MAP } from './maps/classroom';
import { CAMPUS_MAP } from './maps/campus';
import { SIMULATOR_MAP } from './maps/simulator';
import { SCIENCE_LAB_MAP } from './maps/science-lab';
import { ART_STUDIO_MAP } from './maps/art-studio';
import { LIBRARY_MAP } from './maps/library';
import { useFocusFlowStore } from '@/store/useFocusFlowStore';
import type { MapDefinition } from './MapDefinition';
import {
  SPRITE_SHEET_PATH,
  SPRITE_TILE_SIZE,
  SPRITE_MARGIN,
  CHARACTER_SPRITES,
} from '@/lib/sprite-config';

const ALL_MAPS: MapDefinition[] = [
  CLASSROOM_MAP, CAMPUS_MAP,
  SIMULATOR_MAP, SCIENCE_LAB_MAP, ART_STUDIO_MAP, LIBRARY_MAP,
];

function getNPCsForMap(mapId: string, spriteSheet?: SpriteSheet): NPC[] {
  const mapDef = ALL_MAPS.find((m) => m.id === mapId);
  if (!mapDef) return [];
  const activeIds = new Set(mapDef.npcs);
  return CLASSROOM_NPCS
    .filter((cfg) => activeIds.has(cfg.id))
    .map((cfg) => {
      const npc = new NPC(cfg);
      if (cfg.id === 'coach-byte') {
        npc.setStandaloneImage(
          '/sprites/coach-byte.png',
          { sx: 950, sy: 30, sw: 900, sh: 1280 },
          48,
        );
      } else if (spriteSheet) {
        const coord = CHARACTER_SPRITES[cfg.id];
        if (coord) npc.setSprite(spriteSheet, coord);
      }
      return npc;
    });
}

export interface GameState {
  paused: boolean;
  interactingNPC: NPC | null;
}

interface GameCanvasProps {
  onInteract: (npc: NPC) => void;
  onStateChange: (state: GameState) => void;
  cognitiveState: 'focused' | 'okay' | 'drifting' | 'done';
  avgMastery: number;
}

export default function GameCanvas({
  onInteract,
  onStateChange,
  cognitiveState,
  avgMastery,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<KeyState>({ up: false, down: false, left: false, right: false });
  const actionPressedRef = useRef(false);
  const pausedRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const tileMapRef = useRef<TileMap | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const playerRef = useRef<Player | null>(null);
  const npcsRef = useRef<NPC[]>([]);
  const interactionRef = useRef<InteractionManager | null>(null);
  const sceneRef = useRef<SceneManager | null>(null);

  const [, setIsPaused] = useState(false);
  const conceptLocks = useFocusFlowStore((state) => state.conceptLocks);

  const setPaused = useCallback(
    (paused: boolean) => {
      pausedRef.current = paused;
      setIsPaused(paused);
      onStateChange({
        paused,
        interactingNPC: interactionRef.current?.nearestNPC ?? null,
      });
    },
    [onStateChange],
  );

  const activePanel = useFocusFlowStore((state) => state.activePanel);
  useEffect(() => {
    if (!activePanel && pausedRef.current) {
      setPaused(false);
    }
  }, [activePanel, setPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const charSheet = new SpriteSheet(
      SPRITE_SHEET_PATH,
      SPRITE_TILE_SIZE,
      SPRITE_TILE_SIZE,
      SPRITE_MARGIN,
    );

    const sceneManager = new SceneManager(ALL_MAPS, 'classroom');
    const startMap = sceneManager.getCurrentMap();

    let tileMap = new TileMap(startMap);
    const camera = new Camera(tileMap.cols, tileMap.rows);
    const player = new Player(9, 12);
    player.setSprite(charSheet, CHARACTER_SPRITES['player']);
    let npcs = getNPCsForMap(sceneManager.currentMapId, charSheet);
    const interaction = new InteractionManager();

    tileMapRef.current = tileMap;
    cameraRef.current = camera;
    playerRef.current = player;
    npcsRef.current = npcs;
    interactionRef.current = interaction;
    sceneRef.current = sceneManager;

    camera.snapTo(player.x, player.y);

    const keyMap: Record<string, keyof KeyState> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        keysRef.current[dir] = true;
      }
      if ((e.key === ' ' || e.key === 'Enter') && !pausedRef.current) {
        e.preventDefault();
        actionPressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) keysRef.current[dir] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      const transitioning = sceneManager.update();

      if (!pausedRef.current && !transitioning) {
        player.update(keysRef.current, tileMap, npcs);

        const animMultiplier = cognitiveState === 'focused' ? 0.5 : 1;
        npcs.forEach((npc) => npc.update(player.x, player.y, animMultiplier));

        camera.follow(player.x, player.y);
        interaction.update(player, npcs);

        if (actionPressedRef.current) {
          actionPressedRef.current = false;
          const npc = interaction.tryInteract();
          if (npc) {
            setPaused(true);
            onInteract(npc);
          }
        }

        // Check exit zones
        const playerCol = Math.floor((player.x + TILE_SIZE / 2) / TILE_SIZE);
        const playerRow = Math.floor((player.y + TILE_SIZE / 2) / TILE_SIZE);
        const exit = sceneManager.checkExits(playerCol, playerRow);
        if (exit) {
          sceneManager.startTransition(exit, (completedExit) => {
            const newMap = sceneManager.getCurrentMap();
            tileMap = new TileMap(newMap);
            tileMapRef.current = tileMap;
            camera.updateBounds(tileMap.cols, tileMap.rows);

            player.x = completedExit.targetCol * TILE_SIZE;
            player.y = completedExit.targetRow * TILE_SIZE;
            camera.snapTo(player.x, player.y);

            npcs = getNPCsForMap(sceneManager.currentMapId, charSheet);
            npcsRef.current = npcs;
            interaction.update(player, npcs);
          });
        }
      }

      // ── Draw ──
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.imageSmoothingEnabled = false;

      const cam = camera;
      const mastery = avgMastery;
      const isDrifting = cognitiveState === 'drifting';

      tileMap.drawGround(ctx, cam, mastery);
      tileMap.drawFurniture(ctx, cam, mastery);
      tileMap.drawLabels(ctx, cam);

      const hasLocks = conceptLocks.length > 0;
      tileMap.drawDoorLock(ctx, cam, hasLocks);

      const entities: { y: number; draw: () => void }[] = [];
      npcs.forEach((npc) => {
        entities.push({ y: npc.y, draw: () => npc.draw(ctx, cam, isDrifting) });
      });
      entities.push({ y: player.y, draw: () => player.draw(ctx, cam) });
      entities.sort((a, b) => a.y - b.y);
      entities.forEach((e) => e.draw());

      if (!pausedRef.current && !transitioning) {
        interaction.drawPrompt(ctx, CANVAS_WIDTH);
      }

      if (cognitiveState === 'focused') {
        drawVignette(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 'rgba(0,0,0,0.35)');
      } else if (cognitiveState === 'drifting') {
        ctx.fillStyle = 'rgba(255,200,50,0.04)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else if (cognitiveState === 'done') {
        ctx.fillStyle = 'rgba(180,150,100,0.08)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (pausedRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Fade overlay (drawn last, on top of everything)
      sceneManager.drawFade(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block mx-auto"
      style={{
        imageRendering: 'pixelated',
        width: '100%',
        maxWidth: '960px',
        aspectRatio: '4/3',
      }}
      tabIndex={0}
    />
  );
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
): void {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}
