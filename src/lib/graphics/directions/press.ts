// Safe to edit by hand
// Placeholder for the "press" direction (2026-10-27): draws with Night until its own design lands.
import type { Direction } from '../types';
import { night } from './night';

export const press: Direction = {
  ...night,
  id: 'press',
  name: 'press (placeholder)',
  summary: 'Not drawn yet.',
};
