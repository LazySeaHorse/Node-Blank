/** The parts of fast-formula-parser (untyped) that the sheet uses. */
declare module 'fast-formula-parser' {
  export interface CellRef {
    row: number;
    col: number;
    sheet?: string;
  }
  export interface RangeRef {
    from: CellRef;
    to: CellRef;
    sheet?: string;
  }
  export type Position = { row: number; col: number; sheet: string };

  export class FormulaError extends Error {
    static readonly REF: FormulaError;
    static readonly VALUE: FormulaError;
    static readonly NUM: FormulaError;
    readonly error: string;
  }

  export interface FormulaParserConfig {
    onCell?: (ref: CellRef) => unknown;
    onRange?: (ref: RangeRef) => unknown[][];
    functions?: Record<string, (...args: unknown[]) => unknown>;
  }

  export class DepParser {
    parse(formula: string, position: Position): (CellRef | RangeRef)[];
  }

  export default class FormulaParser {
    static readonly DepParser: typeof DepParser;
    static readonly FormulaError: typeof FormulaError;
    static readonly FormulaHelpers: {
      accept(
        param: unknown,
        type?: number,
        defValue?: unknown,
        flat?: boolean,
        allowSingleValue?: boolean,
      ): unknown;
    };
    static readonly Types: { ARRAY: number; NUMBER: number };
    constructor(config?: FormulaParserConfig);
    parse(formula: string, position: Position, allowReturnArray?: boolean): unknown;
  }
}
