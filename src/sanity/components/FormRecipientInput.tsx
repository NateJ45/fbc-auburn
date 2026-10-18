// Safe to edit by hand
// The "Who receives it" picker on a form (schemaTypes/form.ts). Lists the names
// in Site settings > Forms > Who forms can go to, and stores the chosen one's
// short code. Only the code is ever saved: the email address behind it lives
// in the Worker (FORM_RECIPIENTS), never in the public dataset.
import { useEffect, useState } from 'react';
import { set, unset, useClient, type StringInputProps } from 'sanity';
import { Card, Select, Stack, Text } from '@sanity/ui';

interface Recipient {
  key?: string;
  name?: string;
}

const FALLBACK: Recipient[] = [
  { key: 'office', name: 'Church office' },
  { key: 'pastor', name: 'Pastor' },
];

export function FormRecipientInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const client = useClient({ apiVersion: '2024-01-01' });
  const [list, setList] = useState<Recipient[] | null>(null);

  useEffect(() => {
    client
      .fetch<Recipient[] | null>(`*[_type == "siteSettings"][0].formRecipients[]{ key, name }`)
      .then((r) => setList(r && r.length ? r.filter((x) => x?.key) : FALLBACK))
      .catch(() => setList(FALLBACK));
  }, [client]);

  const options = list ?? FALLBACK;
  const known = !value || options.some((o) => o.key === value);

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
        <option value="">Pick who receives it</option>
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.name || o.key}
          </option>
        ))}
        {!known && <option value={value}>{value} (no longer in Site settings)</option>}
      </Select>
      {!known && (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>
            This name is no longer in Site settings, so the form goes to the church office. Pick
            someone from the list.
          </Text>
        </Card>
      )}
    </Stack>
  );
}
