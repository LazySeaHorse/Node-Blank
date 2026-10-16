import { ContextMenu as Radix } from 'radix-ui';
import type { ReactNode } from 'react';
import { type MenuEntry, panelClass, renderEntries } from './Menu';

interface ContextMenuProps {
  /** The area that opens the menu; must be a single element. */
  children: ReactNode;
  items: MenuEntry[];
  disabled?: boolean;
}

/** Opens `items` at the pointer when `children` receives a `contextmenu` event. */
export function ContextMenu({ children, items, disabled }: ContextMenuProps) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild disabled={disabled}>
        {children}
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          // Focus stays wherever the action puts it (e.g. a title being renamed).
          onCloseAutoFocus={(event) => event.preventDefault()}
          collisionPadding={8}
          className={panelClass}
        >
          {renderEntries(Radix, items)}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
