export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const PLAYER_SPEED = 2;
export const INTERACTION_RANGE = TILE_SIZE * 1.5;
export const FPS = 60;

export const TILE_COLORS: Record<number, string> = {
  0: '#f8f8f0',  // floor (cream)
  1: '#8090a0',  // wall (blue-gray)
  2: '#a07850',  // desk (wood brown)
  3: '#f0f0f0',  // whiteboard (white)
  4: '#806040',  // bookshelf (dark wood)
  5: '#c09060',  // lab bench (light wood)
  6: '#e0c030',  // quiz board (yellow)
  7: '#b0c8e0',  // window (light blue)
  8: '#607080',  // door (darker gray)
  9: '#a07850',  // teacher desk (wood)
  10: '#68a048', // grass (green)
  11: '#d0b888', // path/dirt (sandy)
  12: '#5090c0', // pond/water (blue)
  13: '#307030', // tree (dark green)
  14: '#706050', // building roof (dark brown)
  15: '#908070', // fence (grayish)
};

export type Direction = 'down' | 'left' | 'right' | 'up';
export const DIRECTION_INDEX: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};
