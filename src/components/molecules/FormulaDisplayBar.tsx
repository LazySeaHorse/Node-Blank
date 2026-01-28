/**
 * Formula Display Bar Component
 * Displays the formula/value of the currently selected spreadsheet cell
 */
import { Signal } from '@preact/signals';

interface FormulaDisplayBarProps {
    formulaValue: Signal<string>;
}

export function FormulaDisplayBar({ formulaValue }: FormulaDisplayBarProps) {
    return (
        <div className="flex items-center gap-2 bg-surface rounded border border-border-base px-2 py-1 min-w-[200px] max-w-[300px]">
            <span className="text-xs font-semibold text-text-tertiary">fx</span>
            <span className="text-xs text-text-secondary font-mono truncate flex-1">
                {formulaValue.value}
            </span>
        </div>
    );
}
