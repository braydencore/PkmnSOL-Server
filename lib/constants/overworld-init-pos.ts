export interface AllowedSpawnPosition {
  mapId: string;
  x: number;
  y: number;
}

/**
 * Every door-walk destination in the game (mapId + exact spawn tile),
 * generated from the client's authoritative OVERWORLD_INIT_POS table
 * (poposafari/client/src/feats/overworld/maps/door.ts). change_map's
 * spawn coordinates are checked against this so a modified client can't
 * claim an arbitrary map/position; fast-travel ("fly") into a Safari
 * zone is validated separately, since the server computes that spawn
 * itself from the map's registered entry point rather than trusting the
 * client's x/y at all.
 *
 * Regenerate this list (rather than hand-editing) if OVERWORLD_INIT_POS
 * changes: for each entry there, map INIT_POS's `location` (a MAP enum
 * member) to its string id via the MAP enum in
 * poposafari/client/src/types/texture.ts, and emit an {mapId, x, y}
 * triple.
 */
/**
 * Scripted (non-door) transitions -- not in OVERWORLD_INIT_POS since
 * nothing walks through these, so keep this list by hand and don't let a
 * regen of the door table below wipe it out.
 */
const SCRIPTED_TRANSITION_POSITIONS: AllowedSpawnPosition[] = [
  // Catching the s000 tutorial starter sends the player to Popo Town
  // (battle.phase.ts's isS000Tutorial() catch handler).
  { mapId: 'p001', x: 50, y: 30 },
];

export const ALLOWED_CHANGE_MAP_POSITIONS: AllowedSpawnPosition[] = [
  ...SCRIPTED_TRANSITION_POSITIONS,

  { mapId: 'p001', x: 29, y: 28 },
  { mapId: 'p001', x: 29, y: 51 },
  { mapId: 'p001', x: 32, y: 42 },
  { mapId: 'p001', x: 36, y: 28 },
  { mapId: 'p001', x: 44, y: 28 },
  { mapId: 'p001', x: 44, y: 42 },
  { mapId: 'p001', x: 54, y: 28 },
  { mapId: 'p001', x: 64, y: 40 },

  { mapId: 'p002', x: 6, y: 13 },
  { mapId: 'p002', x: 7, y: 13 },

  { mapId: 'p003', x: 6, y: 10 },
  { mapId: 'p003', x: 7, y: 10 },

  { mapId: 'p004', x: 6, y: 10 },
  { mapId: 'p004', x: 7, y: 10 },

  { mapId: 'p005', x: 6, y: 10 },
  { mapId: 'p005', x: 7, y: 10 },

  { mapId: 'p006', x: 7, y: 14 },
  { mapId: 'p006', x: 8, y: 14 },
  { mapId: 'p006', x: 9, y: 3 },

  { mapId: 'p007', x: 6, y: 3 },
  { mapId: 'p007', x: 6, y: 4 },

  { mapId: 'p008', x: 10, y: 14 },
  { mapId: 'p008', x: 11, y: 14 },

  { mapId: 'p009', x: 1, y: 15 },
  { mapId: 'p009', x: 1, y: 16 },

  { mapId: 's001', x: 10, y: 10 },
  { mapId: 's001', x: 22, y: 35 },
  { mapId: 's001', x: 23, y: 35 },
  { mapId: 's001', x: 47, y: 19 },
  { mapId: 's001', x: 47, y: 20 },
  { mapId: 's001', x: 47, y: 21 },

  { mapId: 's002', x: 30, y: 48 },
  { mapId: 's002', x: 30, y: 49 },
  { mapId: 's002', x: 30, y: 50 },
  { mapId: 's002', x: 35, y: 12 },
  { mapId: 's002', x: 36, y: 12 },

  { mapId: 's003', x: 16, y: 21 },
  { mapId: 's003', x: 16, y: 22 },
  { mapId: 's003', x: 16, y: 23 },
  { mapId: 's003', x: 29, y: 45 },
  { mapId: 's003', x: 30, y: 45 },
  { mapId: 's003', x: 47, y: 36 },
  { mapId: 's003', x: 47, y: 37 },
  { mapId: 's003', x: 47, y: 38 },

  { mapId: 's004', x: 20, y: 21 },
  { mapId: 's004', x: 20, y: 22 },
  { mapId: 's004', x: 20, y: 23 },
  { mapId: 's004', x: 28, y: 49 },
  { mapId: 's004', x: 29, y: 49 },
  { mapId: 's004', x: 55, y: 28 },
  { mapId: 's004', x: 55, y: 29 },

  { mapId: 's005', x: 26, y: 10 },
  { mapId: 's005', x: 27, y: 10 },

  { mapId: 's006', x: 16, y: 26 },
  { mapId: 's006', x: 16, y: 27 },
  { mapId: 's006', x: 17, y: 12 },
  { mapId: 's006', x: 62, y: 24 },
  { mapId: 's006', x: 62, y: 25 },

  { mapId: 's007', x: 47, y: 32 },
  { mapId: 's007', x: 47, y: 33 },

  { mapId: 's008', x: 5, y: 21 },
  { mapId: 's008', x: 21, y: 5 },
  { mapId: 's008', x: 39, y: 57 },

  { mapId: 's009', x: 10, y: 19 },
  { mapId: 's009', x: 23, y: 8 },
  { mapId: 's009', x: 54, y: 21 },

  { mapId: 's010', x: 45, y: 15 },

  { mapId: 's011', x: 23, y: 37 },

  { mapId: 's012', x: 25, y: 49 },

  { mapId: 's013', x: 16, y: 18 },
  { mapId: 's013', x: 16, y: 19 },
  { mapId: 's013', x: 65, y: 20 },
  { mapId: 's013', x: 65, y: 21 },

  { mapId: 's014', x: 14, y: 42 },
  { mapId: 's014', x: 14, y: 43 },
  { mapId: 's014', x: 42, y: 15 },
  { mapId: 's014', x: 44, y: 59 },

  { mapId: 's015', x: 2, y: 18 },
  { mapId: 's015', x: 26, y: 32 },

  { mapId: 's016', x: 7, y: 31 },
  { mapId: 's016', x: 9, y: 7 },
  { mapId: 's016', x: 18, y: 3 },
  { mapId: 's016', x: 27, y: 7 },
  { mapId: 's016', x: 43, y: 25 },

  { mapId: 's017', x: 17, y: 34 },
  { mapId: 's017', x: 25, y: 17 },
  { mapId: 's017', x: 42, y: 17 },

  { mapId: 's018', x: 14, y: 4 },
  { mapId: 's018', x: 45, y: 5 },
  { mapId: 's018', x: 52, y: 36 },

  { mapId: 's019', x: 28, y: 13 },
  { mapId: 's019', x: 38, y: 10 },
  { mapId: 's019', x: 67, y: 20 },
  { mapId: 's019', x: 71, y: 37 },

  { mapId: 's020', x: 8, y: 34 },
  { mapId: 's020', x: 40, y: 7 },

  { mapId: 's021', x: 20, y: 21 },
  { mapId: 's021', x: 35, y: 13 },
  { mapId: 's021', x: 36, y: 13 },
  { mapId: 's021', x: 56, y: 40 },
  { mapId: 's021', x: 57, y: 40 },

  { mapId: 's022', x: 23, y: 41 },
  { mapId: 's022', x: 24, y: 41 },

  { mapId: 's023', x: 21, y: 10 },
  { mapId: 's023', x: 22, y: 10 },
  { mapId: 's023', x: 56, y: 13 },

  { mapId: 's024', x: 2, y: 24 },
  { mapId: 's024', x: 34, y: 3 },
  { mapId: 's024', x: 45, y: 17 },

  { mapId: 's025', x: 12, y: 19 },
  { mapId: 's025', x: 18, y: 7 },
  { mapId: 's025', x: 31, y: 16 },
  { mapId: 's025', x: 40, y: 37 },

  { mapId: 's026', x: 36, y: 16 },

  { mapId: 's027', x: 9, y: 7 },

  { mapId: 's028', x: 8, y: 4 },

  { mapId: 's029', x: 7, y: 31 },
  { mapId: 's029', x: 23, y: 11 },
  { mapId: 's029', x: 31, y: 35 },

  { mapId: 's030', x: 4, y: 4 },

  { mapId: 's031', x: 29, y: 5 },

  { mapId: 's032', x: 3, y: 8 },
  { mapId: 's032', x: 14, y: 17 },
  { mapId: 's032', x: 21, y: 11 },

  { mapId: 's033', x: 4, y: 4 },
  { mapId: 's033', x: 27, y: 20 },
  { mapId: 's033', x: 44, y: 27 },

  { mapId: 's034', x: 8, y: 7 },
  { mapId: 's034', x: 32, y: 6 },
  { mapId: 's034', x: 53, y: 6 },

  { mapId: 's035', x: 4, y: 14 },
  { mapId: 's035', x: 22, y: 8 },
  { mapId: 's035', x: 26, y: 42 },
  { mapId: 's035', x: 44, y: 17 },

  { mapId: 's036', x: 8, y: 4 },

  { mapId: 's037', x: 28, y: 7 },

  { mapId: 's038', x: 24, y: 4 },

  { mapId: 's039', x: 15, y: 20 },
  { mapId: 's039', x: 57, y: 21 },
  { mapId: 's039', x: 57, y: 22 },
  { mapId: 's039', x: 57, y: 23 },

  { mapId: 's040', x: 14, y: 12 },
  { mapId: 's040', x: 14, y: 13 },
  { mapId: 's040', x: 14, y: 14 },
  { mapId: 's040', x: 47, y: 16 },
  { mapId: 's040', x: 55, y: 31 },

  { mapId: 's041', x: 16, y: 37 },

  { mapId: 's042', x: 7, y: 31 },
  { mapId: 's042', x: 51, y: 22 },

  { mapId: 's043', x: 11, y: 28 },
  { mapId: 's043', x: 34, y: 7 },
  { mapId: 's043', x: 56, y: 23 },

  { mapId: 's044', x: 20, y: 5 },

  { mapId: 's045', x: 7, y: 19 },

  { mapId: 's046', x: 47, y: 10 },
  { mapId: 's046', x: 48, y: 10 },
];

export function isValidChangeMapTarget(mapId: string, x: number, y: number): boolean {
  return ALLOWED_CHANGE_MAP_POSITIONS.some((p) => p.mapId === mapId && p.x === x && p.y === y);
}
