import { JSX } from 'preact/jsx-runtime';
import { getIconComponent, IconProps } from '../icons';

export interface ActionButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName?: string;
    icon?: JSX.Element | string;
    label?: string;
    iconOnly?: boolean;
}

export function ActionButton({
    iconName,
    icon,
    label,
    iconOnly = false,
    className = '',
    children,
    ...props
}: ActionButtonProps) {

    // Resolve Icon
    let RenderedIcon = null;
    if (iconName) {
        const IconComponent = getIconComponent(iconName);
        if (IconComponent) {
            RenderedIcon = <IconComponent size={iconOnly ? 20 : 18} />;
        }
    } else if (icon) {
        RenderedIcon = typeof icon === 'string' ? <span>{icon}</span> : icon;
    }

    if (iconOnly) {
        return (
            <button
                className={`flex items-center justify-center p-2 bg-transparent border-none text-text-secondary cursor-pointer rounded-md transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary active:bg-surface-active header-icon-btn-migrated ${className}`}
                title={label}
                {...props}
            >
                {RenderedIcon}
                {children}
            </button>
        );
    }

    return (
        <button
            className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-sm text-text-secondary bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-surface-active action-btn-migrated ${className}`}
            {...props}
        >
            {RenderedIcon}
            <span>{label}</span>
            {children}
        </button>
    );
}
