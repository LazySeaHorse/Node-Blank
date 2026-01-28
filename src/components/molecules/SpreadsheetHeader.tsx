/**
 * Spreadsheet Header Component
 * Composes NodeHeader with FormulaDisplayBar for the Spreadsheet node
 */
import { Signal } from '@preact/signals';
import { NodeHeader } from './NodeHeader';
import { FormulaDisplayBar } from './FormulaDisplayBar';

interface SpreadsheetHeaderProps {
    formulaValue: Signal<string>;
}

export function SpreadsheetHeader({ formulaValue }: SpreadsheetHeaderProps) {
    return (
        <NodeHeader
            title="Spreadsheet"
            controls={[<FormulaDisplayBar key="formula" formulaValue={formulaValue} />]}
        />
    );
}
