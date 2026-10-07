import { Switch as RadixSwitch } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Switch({ className, ...props }: ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-full bg-border transition-colors data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  );
}
