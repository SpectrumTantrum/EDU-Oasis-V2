export const SPRITE_SHEET_PATH = '/sprites/roguelikeSheet_transparent.png';
export const SPRITE_TILE_SIZE = 16;
export const SPRITE_MARGIN = 1;

export interface SpriteCoord {
  col: number;
  row: number;
}

export const TILE_SPRITE_MAP: Record<number, SpriteCoord> = {
  0:  { col: 6,  row: 0 },   // floor — tan wooden plank
  1:  { col: 8,  row: 0 },   // wall — grey stone
  2:  { col: 19, row: 6 },   // desk — wooden table
  3:  { col: 7,  row: 2 },   // whiteboard — white/cream stone panel
  4:  { col: 45, row: 14 },  // bookshelf — shelves with colored books
  5:  { col: 20, row: 6 },   // lab bench — table variant
  6:  { col: 10, row: 2 },   // quiz board — dark panel board
  7:  { col: 40, row: 6 },   // window — framed window pane
  8:  { col: 39, row: 2 },   // door — brown arched doorway
  9:  { col: 21, row: 6 },   // teacher desk — desk variant
  10: { col: 3,  row: 16 },  // grass — green with scattered squaresaa
  11: { col: 7,  row: 0 },   // path/dirt — beige/sandy
  12: { col: 15, row: 25 },  // water — solid teal/blue
  13: { col: 16, row: 9 },   // tree — green pine
  14: { col: 5,  row: 5 },   // roof — dark brown
  15: { col: 45, row: 6 },   // fence — wooden fence post
};

export const CHARACTER_SPRITES: Record<string, SpriteCoord> = {
  'player':            { col: 25, row: 10 },  // yellow bird
  'professor-maple':   { col: 30, row: 9 },   // purple flower
  'librarian-rex':     { col: 19, row: 9 },   // green bush
  'coach-byte':        { col: 17, row: 9 },   // orange tree
  'quiz-master-pixel': { col: 32, row: 9 },   // purple gem
  'oracle':            { col: 35, row: 9 },   // golden gem (same as nurse-joy)
  'nurse-joy':         { col: 35, row: 9 },   // golden gem
};
