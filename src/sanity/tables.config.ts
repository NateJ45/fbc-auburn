// Safe to edit by hand
// =============================================================================
// Table panes for long lists (PORTS.md card 117) - THIS SITE'S columns
// =============================================================================
// Each entry adds a "<title>" item to the desk (src/sanity/structure.ts), right
// under the normal list, that opens a sortable table of one document type with
// a status pill per row and an Open button. The normal list stays the default;
// this is an extra view for when the list gets long.
//
// To add one: name the type, write a GROQ projection that produces every
// column key (dereference with ->, flags with defined()), list the columns,
// and pick the default sort. src/lib/studio-table.test.ts fails if a column is
// missing from its projection or the sort key is not a column.
//
// Column kinds: 'text' (default), 'date' (formatted, sorts by time), 'bool'
// (Yes / No), 'list' (an array shown comma-separated).
// =============================================================================
import type { TableConfig } from '../lib/studio-table';
import { DOWNLOAD_CATEGORIES } from '../lib/sermons.ts';

/** The download kind's title ("Bulletin"), not its stored value ("bulletin"). */
const categoryTitle = `select(${DOWNLOAD_CATEGORIES.map(
  (c) => `category == "${c.value}" => "${c.title}"`,
).join(', ')}, category)`;

export const TABLES: TableConfig[] = [
  {
    id: 'sermons-table',
    title: 'Sermons as a table',
    type: 'sermon',
    projection:
      'date, title, "series": series->title, passage, "hasVideo": defined(videoUrl), "hasAudio": defined(audio.asset)',
    columns: [
      { key: 'date', label: 'Date', kind: 'date' },
      { key: 'title', label: 'Title' },
      { key: 'series', label: 'Series' },
      { key: 'passage', label: 'Passage' },
      { key: 'hasVideo', label: 'Video', kind: 'bool' },
      { key: 'hasAudio', label: 'Audio', kind: 'bool' },
    ],
    defaultSort: { key: 'date', dir: 'desc' },
  },
  {
    id: 'downloads-table',
    title: 'Downloads as a table',
    type: 'download',
    projection: `date, title, "category": ${categoryTitle}, expires`,
    columns: [
      { key: 'date', label: 'Date', kind: 'date' },
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Kind' },
      { key: 'expires', label: 'Expires', kind: 'date' },
    ],
    defaultSort: { key: 'date', dir: 'desc' },
  },
  {
    id: 'people-table',
    title: 'People as a table',
    type: 'person',
    projection: 'name, role, "group": group->title',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'group', label: 'Group' },
    ],
    defaultSort: { key: 'name', dir: 'asc' },
  },
];
