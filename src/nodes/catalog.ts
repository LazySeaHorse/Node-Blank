import type { NodeKind } from '@/model/types';
import { codeSpec } from './code/spec';
import { graphSpec } from './graph/spec';
import { imageSpec } from './image/spec';
import { mathSpec } from './math/spec';
import { mathPlusSpec } from './mathPlus/spec';
import { sheetSpec } from './sheet/spec';
import type { NodeSpec } from './spec';
import { tableSpec } from './table/spec';
import { textSpec } from './text/spec';
import { videoSpec } from './video/spec';

/** Registry of node kinds, in toolbar order. */
export const nodeSpecs: { [K in NodeKind]: NodeSpec<K> } = {
  text: textSpec,
  math: mathSpec,
  mathPlus: mathPlusSpec,
  graph: graphSpec,
  table: tableSpec,
  sheet: sheetSpec,
  code: codeSpec,
  image: imageSpec,
  video: videoSpec,
};

export const nodeKinds = Object.keys(nodeSpecs) as NodeKind[];
