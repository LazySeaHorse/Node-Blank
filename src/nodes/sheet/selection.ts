import type { Selection } from 'react-spreadsheet';
import { create } from 'zustand';

/**
 * What each sheet has selected, kept where the right-click menu can reach it: the grid keeps its selection
 * to itself, and the menu is built far from the sheet's component.
 */
const useSheetSelections = create<Record<string, Selection | undefined>>(() => ({}));

export const publishSheetSelection = (id: string, selection: Selection | undefined) =>
  useSheetSelections.setState({ [id]: selection });

export const sheetSelection = (id: string) => useSheetSelections.getState()[id];
