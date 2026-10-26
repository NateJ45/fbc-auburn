// Safe to edit by hand
// =============================================================================
// Site settings > Forms > Who forms can go to, plus "Where their messages go" (2026-10-26)
// =============================================================================
// The list of names stays as it was (Sanity's own list, rendered first). Under it, for a signed-in
// ADMINISTRATOR only, one row per name (and one for the Contact page) with the email address its
// messages go to, a box to change it, and what is happening with a new one ("waiting for the
// link to be pressed"). Everyone else sees one sentence saying an administrator sets these.
//
// The addresses are never in the public dataset: this panel talks to the site's own
// /api/studio/form-recipients/ (src/lib/form-recipients.ts), which keeps them in the Worker's D1
// database and checks the session and the administrator role on every call. A new address is
// emailed a link and starts receiving messages only once it is confirmed; without the email
// backbone it is saved as unconfirmed and the panel says so.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';
import { useClient, useCurrentUser, useFormValue, type ArrayOfObjectsInputProps } from 'sanity';
import { Badge, Box, Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui';
import { studioApi, WORKFLOW_API_VERSION } from '../workflow/studioApi';

const API = '/api/studio/form-recipients/';

interface Row {
  key: string;
  email: string | null;
  pendingEmail: string | null;
  pendingStatus: 'sent' | 'unconfirmed' | null;
}

interface Answer {
  ok?: boolean;
  configured?: boolean;
  canConfirm?: boolean;
  needsMigration?: boolean;
  fallbacks?: Record<string, boolean>;
  rows?: Row[];
  status?: string;
  error?: string;
}

const CONTACT = { key: 'contact', name: 'The Contact page form' };

export function FormRecipientsInput(props: ArrayOfObjectsInputProps) {
  return (
    <Stack gap={4}>
      {props.renderDefault(props)}
      <RecipientEmails />
    </Stack>
  );
}

function RecipientEmails() {
  const user = useCurrentUser();
  const admin = (user?.roles ?? []).some((r) => r.name === 'administrator');
  if (!admin) {
    return (
      <Card padding={3} radius={2} border tone="transparent">
        <Text size={1} muted>
          Where each name&rsquo;s messages go is set by an administrator of this Studio, here under
          the list. Ask Nathan if one needs changing.
        </Text>
      </Card>
    );
  }
  return <AdminPanel />;
}

function AdminPanel() {
  const client = useClient({ apiVersion: WORKFLOW_API_VERSION });
  const names = (useFormValue(['formRecipients']) as { key?: string; name?: string }[]) ?? [];
  const people = [
    ...names.filter((n) => n?.key).map((n) => ({ key: n.key as string, name: n.name || n.key! })),
    CONTACT,
  ];
  const [data, setData] = useState<Answer | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const r = await studioApi<Answer>(client, API);
    setData({ ...r.body, ok: r.status === 200 && r.body.ok });
  }, [client]);
  useEffect(() => {
    void load();
  }, [load]);

  const act = async (key: string, name: string, action: string, email?: string) => {
    setMessage((m) => ({ ...m, [key]: 'Saving...' }));
    const r = await studioApi<Answer>(client, API, {
      method: 'POST',
      body: { action, key, name, email },
    });
    const b = r.body;
    const words = !b.ok
      ? (b.error ?? 'That did not save. Try again in a minute.')
      : b.status === 'sent'
        ? `Saved. We emailed ${email ?? 'the new address'} a link. Messages start going there once it is pressed; until then they go where they went before.`
        : b.status === 'unconfirmed'
          ? 'Saved, but NOT confirmed: email is not set up on the website yet, so no link could be sent and nothing goes to this address. Nathan can switch email on, then press "Send the link again".'
          : b.status === 'cleared'
            ? 'Removed. Messages go to the address set on the website’s server, or the church office.'
            : 'Saved.';
    setMessage((m) => ({ ...m, [key]: words }));
    await load();
  };

  if (!data) {
    return (
      <Card padding={3} radius={2} border>
        <Text size={1}>Checking where form messages go...</Text>
      </Card>
    );
  }
  if (!data.ok) {
    return (
      <Card padding={3} radius={2} border tone="caution">
        <Text size={1}>
          {data.configured === false
            ? data.needsMigration
              ? 'Setting addresses here needs one more step on the website’s server (a database update). Nathan can do it in a minute; until then forms go where Nathan set them.'
              : 'Setting addresses here is not switched on yet (the website’s message store is not connected). Until it is, forms go where Nathan set them.'
            : (data.error ?? 'Could not reach the website. Check the connection and reload.')}
        </Text>
      </Card>
    );
  }

  const rows = new Map((data.rows ?? []).map((r) => [r.key, r]));
  return (
    <Card padding={4} radius={2} border>
      <Stack gap={4}>
        <Stack gap={2}>
          <Text weight="semibold">Where their messages go</Text>
          <Text size={1} muted>
            Only administrators see this. These email addresses are kept on the website&rsquo;s
            server, never in this public information. A new address gets an email with a link, and
            messages start going to it once the link is pressed.
          </Text>
          {!data.canConfirm && (
            <Card padding={3} radius={2} tone="caution">
              <Text size={1}>
                Email is not set up on the website yet, so new addresses cannot be confirmed. You
                can still save one; it waits, unconfirmed, until email is switched on.
              </Text>
            </Card>
          )}
        </Stack>
        {people.map((p) => (
          <PersonRow
            key={p.key}
            person={p}
            row={rows.get(p.key) ?? null}
            server={data.fallbacks?.[p.key] === true}
            note={message[p.key]}
            onAct={act}
          />
        ))}
      </Stack>
    </Card>
  );
}

function PersonRow(props: {
  person: { key: string; name: string };
  row: Row | null;
  server: boolean;
  note?: string;
  onAct: (key: string, name: string, action: string, email?: string) => Promise<void>;
}) {
  const { person, row, server, note, onAct } = props;
  const [value, setValue] = useState('');
  const looksOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  const now = row?.email
    ? `Goes to ${row.email}`
    : server
      ? 'Goes to the address Nathan set on the website’s server'
      : person.key === 'office'
        ? 'Goes to the Contact address'
        : 'Goes to the church office';

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Stack gap={3}>
        <Flex gap={2} align="center" wrap="wrap">
          <Text weight="semibold">{person.name}</Text>
          {row?.email && <Badge tone="positive">Confirmed</Badge>}
        </Flex>
        <Text size={1}>{now}</Text>
        {row?.pendingEmail && (
          <Card padding={3} radius={2} tone={row.pendingStatus === 'sent' ? 'primary' : 'caution'}>
            <Stack gap={3}>
              <Text size={1}>
                {row.pendingStatus === 'sent'
                  ? `Waiting for ${row.pendingEmail} to press the link we emailed.`
                  : `${row.pendingEmail} is saved but not confirmed, so nothing goes to it yet.`}
              </Text>
              <Flex gap={2} wrap="wrap">
                <Button
                  text="Send the link again"
                  mode="ghost"
                  onClick={() => void onAct(person.key, person.name, 'resend', row.pendingEmail!)}
                />
                <Button
                  text="Cancel this change"
                  mode="bleed"
                  onClick={() => void onAct(person.key, person.name, 'cancel')}
                />
              </Flex>
            </Stack>
          </Card>
        )}
        <Flex gap={2} wrap="wrap" align="flex-end">
          <Box flex={1} style={{ minWidth: '14rem' }}>
            <TextInput
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="name@example.org"
              aria-label={`New email address for ${person.name}`}
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
            />
          </Box>
          <Button
            text="Save this address"
            tone="primary"
            disabled={!looksOk}
            onClick={() => {
              const email = value.trim();
              setValue('');
              void onAct(person.key, person.name, 'set', email);
            }}
          />
          {row?.email && (
            <Button
              text="Remove"
              mode="bleed"
              tone="critical"
              onClick={() => void onAct(person.key, person.name, 'clear')}
            />
          )}
        </Flex>
        {note && (
          <Text size={1} muted>
            {note}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
