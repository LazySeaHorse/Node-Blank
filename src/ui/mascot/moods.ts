/** Every face and pose the octopus can wear, each made for one moment in the app. */
export const MASCOT_MOODS = [
  /** The plain face; sways and blinks. */
  'idle',
  /** Faster sway and bob while an agent edits. */
  'working',
  /** Waves hello: the empty canvas. */
  'wave',
  /** A static sideways glance; the pupils follow the cursor instead when `track` is on. */
  'curious',
  /** Confetti, two tentacles up: an export or import finished. */
  'cheer',
  /** Sweat drop: about to delete something. */
  'nervous',
  /** Spiral eyes, knotted tentacles: an error or crash. */
  'tangled',
  /** Closed eyes and z's: idle or waiting states, e.g. a paused or offline canvas. */
  'sleepy',
  /** Holds a cable: AI control (the AI panel and the AI popups). */
  'plug',
  /** Holds a PDF page: the PDF node and importing a document. */
  'reading',
  /** A floating sum sign above the head: the AI is thinking or computing. */
  'thinking',
  /** Grips an edge and looks up: the mobile view-only canvas and other "peeking in" screens. */
  'peek',
  /** Holds a tiny canvas grid. */
  'map',
] as const;

export type MascotMood = (typeof MASCOT_MOODS)[number];

/** The usual frame around the octopus, in the logo mark's coordinates. */
export const MASCOT_FRAME = '0 0 128 128';

/** Wider or taller frames for moods whose props reach past the body. */
const WIDE_FRAMES: Partial<Record<MascotMood, string>> = {
  wave: '0 -6 140 134',
  cheer: '-10 -16 148 144',
  nervous: '0 0 140 128',
  sleepy: '0 -10 140 138',
  plug: '0 0 146 128',
  /** The ledge runs a little past the frame on three sides. */
  peek: '-6 0 140 136',
  thinking: '0 -34 128 162',
};

export function mascotViewBox(mood: MascotMood): string {
  return WIDE_FRAMES[mood] ?? MASCOT_FRAME;
}

/** Width over height of the mood's frame. */
export function mascotAspect(mood: MascotMood): number {
  const [, , width, height] = mascotViewBox(mood).split(' ').map(Number);
  return width / height;
}

/** The octopus's centre line, in the logo mark's coordinates. Every frame is centred on it. */
export const MASCOT_CENTER_X = 64;

/** Where the tips of the resting tentacles land (the octopus's baseline), in the logo mark's coordinates. */
export const MASCOT_FEET_Y = 117;

/** Where the octopus's centre line sits across the mood's frame, from 0 (left edge) to 1 (right edge). */
export function mascotCenterX(mood: MascotMood): number {
  const [x, , width] = mascotViewBox(mood).split(' ').map(Number);
  return (MASCOT_CENTER_X - x) / width;
}
