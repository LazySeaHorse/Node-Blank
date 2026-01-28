import { JSX } from 'preact/jsx-runtime';
import { getIconComponent } from '../icons';

export interface ModeButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName?: string;
    icon?: string;
    label: string;
    isActive?: boolean;
}

export function ModeButton({
    iconName,
    icon,
    label,
    isActive = false,
    onClick,
    className = '',
    ...props
}: ModeButtonProps) {
    const commonClasses = 'flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer border';

    // Inactive: Gray text, transparent bg, hover effects
    const inactiveClasses = 'text-text-secondary bg-transparent border-transparent hover:bg-surface-hover hover:text-text-primary';

    // Active: Accent color text, surface bg, border, shadow
    const activeClasses = 'bg-surface shadow-sm text-accent border-border-base';

    const finalClass = `${commonClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`;

    let RenderedIcon;
    if (iconName) {
        const IconComponent = getIconComponent(iconName);
        if (IconComponent) {
            RenderedIcon = <IconComponent size={18} />;
        }
    } else if (icon) {
        RenderedIcon = <span>{icon}</span>;
    }

    return (
        <button className={finalClass} onClick={onClick} {...props}>
            {RenderedIcon}
            <span>{label}</span>
        </button>
    );
}
