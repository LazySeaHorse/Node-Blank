import type { ReactNode } from 'react';

export interface ToolDefinition {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  keywords: string[];
  component: ReactNode;
  formulaNote?: string;
}
