/// <reference types="remark-parse" />

import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { Construct, Extension, State, TokenizeContext } from 'micromark-util-types';
import remarkMath from 'remark-math';
import type { Processor } from 'unified';

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    mathFenceProbe: 'mathFenceProbe';
    mathDisplay: 'mathDisplay';
    mathDisplaySequence: 'mathDisplaySequence';
    mathDisplayData: 'mathDisplayData';
  }
}

/**
 * remark-math, with Obsidian's rule for `$$`: a block opens at any `$$` and closes at the next
 * one, wherever they sit in the line. Stock remark-math treats `$$` like a code fence and only
 * accepts it alone on its line, so `$$\begin{aligned}` or `\end{aligned}$$ to approximate…`
 * swallows the rest of the document into one broken math node.
 *
 * Two changes on top of remark-math:
 * - the flow (fenced) construct is skipped unless `$$` really is alone on its line, so
 *   standard fenced blocks keep working, blank lines inside included;
 * - any other `$$ … $$` is parsed as display math inside the paragraph.
 */

const DOLLAR = 36;
const isEol = (code: number | null) => code === -5 || code === -4 || code === -3;

/** Lookahead only: `$$` (two or more) followed by nothing but spaces to the end of the line. */
const fenceAloneOnLine: Construct = {
  partial: true,
  tokenize(effects, ok, nok) {
    let size = 0;
    return start;

    function start(code: number | null) {
      effects.enter('mathFenceProbe');
      return sequence(code);
    }

    function sequence(code: number | null): ReturnType<State> {
      if (code === DOLLAR) {
        effects.consume(code);
        size++;
        return sequence;
      }
      return size >= 2 ? trailing(code) : nok(code);
    }

    function trailing(code: number | null): ReturnType<State> {
      if (code === 32 || code === -2 || code === -1) {
        effects.consume(code);
        return trailing;
      }
      if (code === null || isEol(code)) {
        effects.exit('mathFenceProbe');
        return ok(code);
      }
      return nok(code);
    }
  },
};

function guardedFlow(fenced: Construct): Construct {
  return {
    name: 'mathFlowFenceAlone',
    concrete: fenced.concrete,
    tokenize(effects, ok, nok) {
      return (code) => effects.check(fenceAloneOnLine, accept, nok)(code);
      function accept(code: number | null) {
        return effects.attempt(fenced, ok, nok)(code);
      }
    },
  };
}

/** `$$ … $$` across any number of lines (never `$$$`, never unterminated). */
const displayText: Construct = {
  name: 'mathDisplay',
  tokenize(this: TokenizeContext, effects, ok, nok) {
    let opened = 0;
    let closing = 0;
    let sequence: ReturnType<typeof effects.enter>;
    return start;

    function start(code: number | null) {
      effects.enter('mathDisplay');
      effects.enter('mathDisplaySequence');
      return open(code);
    }

    function open(code: number | null): ReturnType<State> {
      if (code === DOLLAR) {
        effects.consume(code);
        opened++;
        return open;
      }
      if (opened !== 2) return nok(code);
      effects.exit('mathDisplaySequence');
      return between(code);
    }

    function between(code: number | null): ReturnType<State> {
      if (code === null) return nok(code);
      if (code === DOLLAR) {
        sequence = effects.enter('mathDisplaySequence');
        closing = 0;
        return close(code);
      }
      if (isEol(code)) {
        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        return between;
      }
      effects.enter('mathDisplayData');
      return data(code);
    }

    function data(code: number | null): ReturnType<State> {
      if (code === null || code === DOLLAR || isEol(code)) {
        effects.exit('mathDisplayData');
        return between(code);
      }
      effects.consume(code);
      return data;
    }

    function close(code: number | null): ReturnType<State> {
      if (code === DOLLAR) {
        effects.consume(code);
        closing++;
        return close;
      }
      if (closing === 2) {
        effects.exit('mathDisplaySequence');
        effects.exit('mathDisplay');
        return ok(code);
      }
      // A lone `$` or `$$$` inside the math is content, not a delimiter.
      sequence.type = 'mathDisplayData';
      return data(code);
    }
  },
};

const displayFromMarkdown: FromMarkdownExtension = {
  enter: {
    mathDisplay(token) {
      this.enter(
        {
          type: 'inlineMath',
          value: '',
          data: {
            hName: 'code',
            hProperties: { className: ['language-math', 'math-display'] },
            hChildren: [],
          },
        } as never,
        token,
      );
      this.buffer();
    },
  },
  exit: {
    mathDisplay(token) {
      const value = this.resume();
      const node = this.stack[this.stack.length - 1] as unknown as {
        value: string;
        data: { hChildren: unknown[] };
      };
      this.exit(token);
      node.value = value;
      node.data.hChildren.push({ type: 'text', value });
    },
    mathDisplayData(token) {
      this.config.enter.data?.call(this, token);
      this.config.exit.data?.call(this, token);
    },
  },
};

export default function remarkObsidianMath(this: Processor) {
  remarkMath.call(this);
  const micromark = this.data('micromarkExtensions') as Extension[];
  const stock = micromark[micromark.length - 1];
  const fenced = stock.flow?.[DOLLAR] as Construct;
  stock.flow = { [DOLLAR]: guardedFlow(fenced) };
  // Added last, so micromark tries it before stock's single-dollar `$$x$$` inline math.
  micromark.push({ text: { [DOLLAR]: displayText } });
  (this.data('fromMarkdownExtensions') as FromMarkdownExtension[]).push(displayFromMarkdown);
}
