import { JSX } from 'preact/jsx-runtime';

export interface IconProps extends JSX.SVGAttributes<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
}

const DefaultIcon = ({ size = 24, strokeWidth = 2.5, children, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {children}
    </svg>
);

// --- Existing Icons ---
export const IconMoreHorizontal = (props: IconProps) => (
    <DefaultIcon {...props}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></DefaultIcon>
);
export const IconSettings = (props: IconProps) => (
    <DefaultIcon {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.29 1.52 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></DefaultIcon>
);
export const IconArrowLeft = (props: IconProps) => (
    <DefaultIcon {...props}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></DefaultIcon>
);
export const IconArrowRight = (props: IconProps) => (
    <DefaultIcon {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></DefaultIcon>
);
export const IconX = (props: IconProps) => (
    <DefaultIcon {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></DefaultIcon>
);
export const IconTerminal = (props: IconProps) => (
    <DefaultIcon {...props}><polyline points="4 17 10 11" /><line x1="12" y1="19" x2="20" y2="19" /></DefaultIcon>
);
export const IconPlay = (props: IconProps) => (
    <DefaultIcon {...props}><polygon points="5 3 19 12 5 21 5 3" /></DefaultIcon>
);
export const IconSun = (props: IconProps) => (
    <DefaultIcon {...props} strokeWidth={0} fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /></DefaultIcon>
);
export const IconMoon = (props: IconProps) => (
    <DefaultIcon {...props} strokeWidth={0} fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" /></DefaultIcon>
);

// --- New Icons for Header & Tools ---

export const IconFolder = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></DefaultIcon>
);
export const IconMenu = (props: IconProps) => (
    <DefaultIcon {...props}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></DefaultIcon>
);
export const IconUndo = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></DefaultIcon>
);
export const IconUpload = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></DefaultIcon>
);
export const IconDownload = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></DefaultIcon>
);
export const IconSave = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></DefaultIcon>
);
export const IconFunction = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M8 9l3 6 2.5-4" /><path d="M3 4h5l3 6h3" /><path d="M19 19h-5" /></DefaultIcon> // Approximate
);
export const IconCalculator = (props: IconProps) => (
    <DefaultIcon {...props}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="14" /><line x1="16" y1="18" x2="16" y2="18" /><line x1="12" y1="18" x2="12" y2="18" /><line x1="8" y1="18" x2="8" y2="18" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="8" y1="14" x2="8" y2="14" /></DefaultIcon>
);
export const IconType = (props: IconProps) => (
    <DefaultIcon {...props}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></DefaultIcon>
);
export const IconChart = (props: IconProps) => (
    <DefaultIcon {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></DefaultIcon>
);
export const IconTable2 = (props: IconProps) => (
    <DefaultIcon {...props}><path d="M9 3H5a2 2 0 0 0-2 2v4h10V3z" /><path d="M19 3h-4v6h10V5a2 2 0 0 0-2-2z" /><path d="M21 13H15v10h4a2 2 0 0 0 2-2v-8z" /><path d="M11 23V13H3v8a2 2 0 0 0 2 2h6z" /></DefaultIcon>
);
export const IconSheet = (props: IconProps) => (
    <DefaultIcon {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></DefaultIcon>
);
export const IconImage = (props: IconProps) => (
    <DefaultIcon {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></DefaultIcon>
);
export const IconVideo = (props: IconProps) => (
    <DefaultIcon {...props}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></DefaultIcon>
);
export const IconSearch = (props: IconProps) => (
    <DefaultIcon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></DefaultIcon>
);


export const ICON_MAP: Record<string, (props: IconProps) => JSX.Element> = {
    'more-horizontal': IconMoreHorizontal,
    'settings': IconSettings,
    'arrow-left': IconArrowLeft,
    'arrow-right': IconArrowRight,
    'x': IconX,
    'terminal': IconTerminal,
    'play': IconPlay,
    'sun': IconSun,
    'moon': IconMoon,
    'folder': IconFolder,
    'menu': IconMenu,
    'undo': IconUndo,
    'upload': IconUpload,
    'download': IconDownload,
    'save': IconSave,
    'function': IconFunction,
    'calculator': IconCalculator,
    'type': IconType,
    'chart': IconChart,
    'table-2': IconTable2,
    'sheet': IconSheet,
    'image': IconImage,
    'video': IconVideo,
    'search': IconSearch
};

export function getIconComponent(name: string) {
    return ICON_MAP[name] || null;
}
