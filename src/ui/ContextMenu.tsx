import { DropdownMenu } from 'radix-ui';
import { type MenuEntry, panelClass, renderEntries } from './Menu';

interface ContextMenuProps {
  /** Where the menu opens, in screen coordinates; null keeps it closed. */
  at: { x: number; y: number } | null;
  items: MenuEntry[];
  onClose: () => void;
}

/** A menu of `items` opened at a point on screen, e.g. where the user right-clicked. */
export function ContextMenu({ at, items, onClose }: ContextMenuProps) {
  return (
    <DropdownMenu.Root open={at !== null} onOpenChange={(open) => !open && onClose()}>
      {/* A zero-size anchor at the point; the menu is only ever opened from code. */}
      <DropdownMenu.Trigger asChild>
        <span aria-hidden className="pointer-events-none fixed size-0" style={{ left: at?.x, top: at?.y }} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          // Focus stays wherever the action puts it (e.g. a title being renamed).
          onCloseAutoFocus={(event) => event.preventDefault()}
          collisionPadding={8}
          className={panelClass}
        >
          {renderEntries(DropdownMenu, items, onClose)}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
