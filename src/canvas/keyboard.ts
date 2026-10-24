/** True when the target is a field with its own text editing: inputs, CodeMirror, MathLive. */
export function isTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.matches('input, textarea, select, math-field');
}

/**
 * True inside a field that saves every edit to the canvas (class `canvas-history`: math, markdown, code).
 * Undo there steps through the canvas history, the one history every edit is in.
 */
export function editsCanvas(target: EventTarget | null) {
  return target instanceof Element && target.closest('.canvas-history') !== null;
}

/** True when keys should go to a text field or the spreadsheet grid rather than the canvas. */
export function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return isTextField(target) || target.closest('.nokey') !== null;
}
