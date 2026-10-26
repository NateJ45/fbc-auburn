// Safe to edit by hand
// "Which gathering" on a "A different Sunday" entry (schemaTypes/churchFacts.ts `timeChanges`).
// Lists the rows of Church facts > Service times on the same Site settings document, plus
// "Everything that day", and stores the chosen row's key. The website also accepts a gathering's
// NAME here ("Worship"), which is what the Quick update job saves, so an entry made from a phone
// shows its name in the list too.
import { set, unset, useFormValue, type StringInputProps } from 'sanity';
import { Card, Select, Stack, Text } from '@sanity/ui';

interface Row {
  _key?: string;
  label?: string;
  day?: string;
  time?: string;
}

const DAY = (d?: string) => (d ? d[0].toUpperCase() + d.slice(1) : '');

export function ServicePickerInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const rows = (useFormValue(['serviceTimes']) as Row[] | undefined) ?? [];
  const usable = rows.filter((r) => r?._key && r.label);
  const known =
    !value ||
    value === 'all' ||
    usable.some(
      (r) => r._key === value || (r.label ?? '').toLowerCase() === String(value).toLowerCase(),
    );

  return (
    <Stack gap={2}>
      <Select
        {...elementProps}
        value={value ?? ''}
        onChange={(e) => {
          const next = e.currentTarget.value;
          onChange(next ? set(next) : unset());
        }}
      >
        <option value="">Pick a gathering</option>
        {usable.map((r) => (
          <option key={r._key} value={r._key}>
            {r.label} ({DAY(r.day)} {r.time})
          </option>
        ))}
        <option value="all">Everything that day</option>
        {!known && <option value={value}>{value}</option>}
      </Select>
      {usable.length === 0 && (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>Add your service times above first, then pick one here.</Text>
        </Card>
      )}
    </Stack>
  );
}
