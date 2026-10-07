import { render } from '@testing-library/react';
import { Tooltip } from 'radix-ui';
import type { ReactElement } from 'react';

/** render() with the app-level providers that UI primitives depend on. */
export const renderUi = (ui: ReactElement) => render(<Tooltip.Provider>{ui}</Tooltip.Provider>);
