import { createContext, useContext } from 'react';

/** True when the canvas is view-only (small/touch screens). Nodes render static content. */
export const ReadOnlyContext = createContext(false);

export const useReadOnly = () => useContext(ReadOnlyContext);
