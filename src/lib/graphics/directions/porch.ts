// Safe to edit by hand
// Placeholder for the "porch" direction (2026-10-27): draws with Night until its own design lands.
import type { Direction } from '../types';
import { night } from './night';

export const porch: Direction = {
  ...night,
  id: 'porch',
  name: 'porch (placeholder)',
  summary: 'Not drawn yet.',
};
