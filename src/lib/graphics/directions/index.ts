// Safe to edit by hand
// The graphics maker's design directions (2026-10-27). The styleguide wall shows every one; the
// Studio tool draws with DEFAULT_DIRECTION. docs/agent/graphics.md.

import type { Direction } from '../types.ts';
import { night } from './night.ts';
import { porch } from './porch.ts';
import { press } from './press.ts';

export const DIRECTIONS: Direction[] = [night, porch, press];

export const DEFAULT_DIRECTION: Direction = night;
