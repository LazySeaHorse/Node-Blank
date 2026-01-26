/**
 * MARKDOWN + LATEX RENDERER
 * Protects LaTeX from markdown parser, runs marked, then runs KaTeX.
 */
import { marked } from 'marked';
import katex from 'katex';

export function mdRenderer(rawText) {
    if (!rawText) return '';

    const mathBlocks = [];

    // 1. Extract Math to alphanumeric placeholders
    const protectedText = rawText.replace(/\$\$([\s\S]+?)\$\$|\$((?!\$)[\s\S]+?)\$/g, (match, blockTex, inlineTex) => {
        const tex = blockTex || inlineTex;
        const isBlock = !!blockTex;
        const id = mathBlocks.length;
        mathBlocks.push({ id, tex, isBlock });
        return `MATHBLOCK${id}ENDMATHBLOCK`;
    });

    // 2. Parse Markdown
    let html = marked.parse(protectedText);

    // 3. Restore Math and Render with KaTeX
    mathBlocks.forEach(item => {
        const placeholder = `MATHBLOCK${item.id}ENDMATHBLOCK`;
        try {
            const rendered = katex.renderToString(item.tex, {
                displayMode: item.isBlock,
                throwOnError: false,
                output: 'html'
            });
            html = html.split(placeholder).join(rendered);
        } catch (e) {
            html = html.split(placeholder).join(`<span class="text-red-500 bg-red-50 px-1 rounded">Math Error</span>`);
        }
    });

    return html;
}
