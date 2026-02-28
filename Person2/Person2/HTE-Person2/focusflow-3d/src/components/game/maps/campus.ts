import type { MapDefinition } from '../MapDefinition';

// Tile legend:
//  0 = indoor floor    1 = wall          2 = desk      3 = whiteboard
//  4 = bookshelf       5 = lab bench     6 = quiz board  7 = window
//  8 = door            9 = teacher desk
// 10 = grass          11 = path/dirt    12 = pond/water  13 = tree
// 14 = building roof  15 = fence

const G = 10;  // grass
const P = 11;  // path
const W = 12;  // water/pond
const T = 13;  // tree
const R = 14;  // roof (non-walkable building fill)
// 15 = fence (reserved, not used in this map yet)

// 40 cols x 30 rows
const GROUND_MAP: number[][] = [
  // Row 0: top border — trees and grass
  [T,T,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T,T],
  // Row 1: grass with tree accents
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
  // Row 2: Main Hall top wall and Open Classroom top wall
  [G,G,1,1,1,1,1,1,1,1,1,1,1,1,G,G,G,G,G,G,G,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,G,G],
  // Row 3: Main Hall interior + Classroom: Science area top
  [G,G,1,R,R,R,R,R,R,R,R,R,R,1,G,G,G,G,G,G,G,1,R,R,R,R,R,R,R,1,R,R,R,R,R,R,R,1,G,G],
  // Row 4: Main Hall interior + Classroom interior
  [G,G,1,R,R,R,R,R,R,R,R,R,R,1,G,T,G,G,G,G,G,1,R,R,R,R,R,R,R,1,R,R,R,R,R,R,R,1,G,G],
  // Row 5: Main Hall interior + Classroom: Arts / Humanities divider
  [G,G,1,R,R,R,R,R,R,R,R,R,R,1,G,G,G,G,G,G,G,1,R,R,R,R,R,R,R,1,R,R,R,R,R,R,R,1,G,G],
  // Row 6: Main Hall bottom wall + door, Classroom continues
  [G,G,1,1,1,1,1,8,8,1,1,1,1,1,G,G,G,G,G,G,G,1,R,R,R,R,R,R,R,1,R,R,R,R,R,R,R,1,G,G],
  // Row 7: path in front of Main Hall + path to classroom
  [G,G,G,G,G,G,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,1,1,1,1,8,8,1,1,1,1,1,8,8,1,1,1,1,G,G],
  // Row 8: main horizontal path connecting everything
  [G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G],
  // Row 9: path continues south + pond area
  [G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 10: grass with pond
  [G,G,G,G,P,P,G,G,G,G,W,W,W,G,G,G,G,G,P,P,G,G,G,G,G,G,W,W,W,W,G,G,G,G,G,G,G,G,G,G],
  // Row 11
  [G,G,G,G,P,P,G,G,G,W,W,W,W,W,G,G,G,G,P,P,G,G,G,G,G,W,W,W,W,W,W,G,G,G,G,G,G,T,G,G],
  // Row 12: path goes down toward Simulator
  [G,G,G,G,P,P,G,G,G,G,W,W,W,G,G,G,G,G,P,P,G,G,G,G,G,G,W,W,W,W,G,G,G,G,G,G,G,G,G,G],
  // Row 13
  [G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 14: path fork
  [G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 15: Simulator Area top wall
  [G,G,1,1,1,1,1,1,1,1,1,1,1,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,1,1,1,1,1,1,1,1,G,G],
  // Row 16: Simulator interior
  [G,G,1,R,R,R,R,R,R,R,R,R,1,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,1,R,R,R,R,R,R,1,G,G],
  // Row 17
  [G,G,1,R,R,R,R,R,R,R,R,R,1,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,1,R,R,R,R,R,R,1,G,G],
  // Row 18
  [G,G,1,R,R,R,R,R,R,R,R,R,1,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,1,R,R,R,R,R,R,1,G,G],
  // Row 19: Simulator bottom wall + door
  [G,G,1,1,1,1,8,8,1,1,1,1,1,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,1,1,1,8,8,1,1,1,G,G],
  // Row 20: path out of Simulator
  [G,G,G,G,G,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,P,P,G,G,G,G,G],
  // Row 21: connect back to lower path
  [G,G,G,G,G,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,P,P,G,G,G,G,G],
  // Row 22: lower horizontal path
  [G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G],
  // Row 23
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 24: some trees
  [G,G,T,G,G,G,G,G,G,T,G,G,G,G,G,G,G,G,G,G,G,G,G,T,G,G,G,G,G,G,G,G,G,G,G,G,T,G,G,G],
  // Row 25
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 26
  [G,G,G,G,G,G,G,T,G,G,G,G,G,G,G,G,G,G,T,G,G,G,G,G,G,G,G,G,T,G,G,G,G,G,G,G,G,G,G,G],
  // Row 27
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
  // Row 28: bottom border
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
  // Row 29
  [T,T,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T,T],
];

const FURNITURE_MAP: number[][] = Array.from({ length: 30 }, (_, row) => {
  const r = new Array(40).fill(0);

  // Building labels via furniture tiles inside buildings
  // Main Hall (rows 3-5, cols 3-12): desks and bookshelves inside
  if (row === 3) { r[5] = 4; r[6] = 4; r[10] = 4; r[11] = 4; }
  if (row === 4) { r[4] = 2; r[5] = 2; r[10] = 2; r[11] = 2; }

  // Open Classroom Area — Science (rows 3-4, cols 22-28)
  if (row === 3) { r[23] = 5; r[24] = 5; r[25] = 5; r[26] = 5; }
  // Open Classroom Area — Arts (rows 3-6, cols 31-36)
  if (row === 4) { r[32] = 3; r[33] = 3; r[34] = 3; }
  // Open Classroom Area — Humanities (rows 5-6, cols 22-28)
  if (row === 5) { r[23] = 2; r[24] = 2; r[27] = 6; r[28] = 6; }
  // Open Classroom Area — Math (rows 5-6, cols 31-36)
  if (row === 6) { r[32] = 6; r[33] = 6; r[34] = 6; }

  // Simulator Area furniture (rows 16-18, cols 3-11)
  if (row === 17) { r[5] = 5; r[6] = 5; r[7] = 5; r[8] = 5; r[9] = 5; }
  if (row === 18) { r[5] = 5; r[6] = 5; r[7] = 5; r[8] = 5; r[9] = 5; }

  // Bottom-right building furniture (rows 16-18, cols 31-36)
  if (row === 17) { r[32] = 2; r[33] = 2; r[34] = 2; r[35] = 2; }

  // Door tiles on the campus ground layer (already have type 8 in GROUND_MAP)
  // Main Hall entrance: row 6, cols 7-8
  if (row === 6) { r[7] = 8; r[8] = 8; }
  // Open Classroom left entrance: row 7, cols 25-26
  if (row === 7) { r[25] = 8; r[26] = 8; }
  // Open Classroom right entrance: row 7, cols 32-33
  if (row === 7) { r[32] = 8; r[33] = 8; }
  // Simulator entrance: row 19, cols 6-7
  if (row === 19) { r[6] = 8; r[7] = 8; }
  // Bottom-right building entrance: row 19, cols 33-34
  if (row === 19) { r[33] = 8; r[34] = 8; }

  return r;
});

export const CAMPUS_MAP: MapDefinition = {
  id: 'campus',
  cols: 40,
  rows: 30,
  groundMap: GROUND_MAP,
  furnitureMap: FURNITURE_MAP,
  exits: [
    // Main Hall -> classroom
    { col: 7, row: 6, targetMap: 'classroom', targetCol: 9,  targetRow: 12 },
    { col: 8, row: 6, targetMap: 'classroom', targetCol: 10, targetRow: 12 },
    // Science Wing -> science-lab
    { col: 25, row: 7, targetMap: 'science-lab', targetCol: 7, targetRow: 9 },
    { col: 26, row: 7, targetMap: 'science-lab', targetCol: 8, targetRow: 9 },
    // Arts Wing -> art-studio
    { col: 32, row: 7, targetMap: 'art-studio', targetCol: 7, targetRow: 9 },
    { col: 33, row: 7, targetMap: 'art-studio', targetCol: 8, targetRow: 9 },
    // Simulator -> simulator
    { col: 6, row: 19, targetMap: 'simulator', targetCol: 7, targetRow: 9 },
    { col: 7, row: 19, targetMap: 'simulator', targetCol: 8, targetRow: 9 },
    // Library -> library
    { col: 33, row: 19, targetMap: 'library', targetCol: 7, targetRow: 9 },
    { col: 34, row: 19, targetMap: 'library', targetCol: 8, targetRow: 9 },
  ],
  npcs: [],
  labels: [
    { text: 'Main Hall', col: 7, row: 1 },
    { text: 'Science Wing', col: 25, row: 1 },
    { text: 'Arts Wing', col: 34, row: 1 },
    { text: 'Simulator', col: 7, row: 14 },
    { text: 'Library', col: 34, row: 14 },
  ],
};
