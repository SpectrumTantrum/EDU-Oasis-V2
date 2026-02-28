export interface ExitZone {
  col: number;
  row: number;
  targetMap: string;
  targetCol: number;
  targetRow: number;
}

export interface MapLabel {
  text: string;
  col: number;
  row: number;
}

export interface MapDefinition {
  id: string;
  cols: number;
  rows: number;
  groundMap: number[][];
  furnitureMap: number[][];
  exits: ExitZone[];
  npcs: string[];
  labels?: MapLabel[];
}
