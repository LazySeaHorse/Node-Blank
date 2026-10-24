# Patches

Applied to `node_modules` by `patch-package` on every install (`postinstall`). Vite resolves `mathlive` to
the unminified `mathlive.mjs` in every mode (see `vite.config.ts`), so that is the one file patched.

## mathlive

- **Caret into an empty argument.** `ModeEditor.insert` meant to put the caret inside a command's empty
  argument but selected one offset too far, taking in the whole command. `\hat` committed from LaTeX mode
  then lost its argument: the next key replaced the accent or landed beside it.
- **Balanced drag selection.** `extendSelectionTo` only grew a drag to whole fractions, scripts and accents,
  so a drag across a square root, parentheses or integral limits ended at a different depth than it began,
  highlighting and copying only part of the math. `balanceRange` lifts both ends to the same branch; ends
  on different lines of a multi-line field stay on their lines.

When upgrading MathLive, re-apply these by hand to the new `mathlive.mjs` and run `npx patch-package mathlive`.
