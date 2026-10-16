/** True when keys should go to a text field (inputs, CodeMirror, MathLive, spreadsheet) rather than the canvas. */
export function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable || target.matches('input, textarea, select') || target.closest('.nokey') !== null
  );
}
