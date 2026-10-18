// Safe to edit by hand
// =============================================================================
// ChurchOverview: "Our church at a glance", the first item in Content
// =============================================================================
// FBC Auburn (2026-10-18). Replaces the starter's BusinessOverview ("Your
// business at a glance": services, prices, travel fees), which queried types
// this site does not have. Everything here is read live from the Church facts
// on Site settings (src/sanity/schemaTypes/churchFacts.ts), so it can never
// disagree with the website. Read-only: the button opens Site settings, where
// the facts are changed.
//
// "To confirm" mirrors the site's own placeholder badge: a fact nobody has
// ticked as confirmed shows the same flag here, so the pastor can see at a
// glance what is still waiting on him.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Card, Container, Flex, Heading, Stack, Text } from '@sanity/ui';

interface ServiceTime {
  _key?: string;
  label?: string;
  day?: string;
  time?: string;
  note?: string;
  confirmed?: boolean;
}

interface Facts {
  title?: string;
  email?: string;
  phone?: string;
  foundedYear?: number;
  churchAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    findUs?: string;
    confirmed?: boolean;
  };
  serviceTimes?: ServiceTime[];
  hasYoutube?: boolean;
  hasCalendar?: boolean;
}

const QUERY = `*[_id == "siteSettings"][0]{
  title, email, phone, foundedYear, churchAddress, serviceTimes,
  "hasYoutube": defined(youtubeChannelId),
  "hasCalendar": defined(churchTracIcalUrl)
}`;

/** "09:45" -> "9:45 am". Anything else is shown as typed. */
function niceTime(t?: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? '');
  if (!m) return t ?? '?';
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${m[2]} ${suffix}`;
}

const capitalize = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '?');

function ToConfirm({ confirmed }: { confirmed?: boolean }) {
  return confirmed ? null : (
    <Badge tone="caution" fontSize={0}>
      To confirm
    </Badge>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size={1} weight="semibold" muted>
        {label}
      </Text>
      {children}
    </Stack>
  );
}

export default function ChurchOverview() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [facts, setFacts] = useState<Facts | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    client
      .fetch<Facts | null>(QUERY)
      .then((d) => setFacts(d ?? {}))
      .catch(() => setFailed(true));
  }, [client]);

  const a = facts?.churchAddress;
  const address = [a?.street, [a?.city, a?.state].filter(Boolean).join(', '), a?.zip]
    .filter(Boolean)
    .join(' ');

  return (
    <Container width={1} padding={4}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Heading as="h1" size={3}>
            Our church at a glance
          </Heading>
          <Text muted size={1}>
            What the website tells visitors, read live from Church facts in Site settings. Change
            anything there and every page that shows it follows.
          </Text>
        </Stack>

        {failed && (
          <Card padding={4} radius={2} tone="caution">
            <Text size={1}>Could not load the church facts right now. Open Site settings.</Text>
          </Card>
        )}
        {!facts && !failed && (
          <Text size={1} muted>
            Loading...
          </Text>
        )}

        {facts && (
          <Card padding={4} radius={2} shadow={1}>
            <Stack gap={5}>
              <Row label="Service times">
                {facts.serviceTimes?.length ? (
                  <Stack gap={3}>
                    {facts.serviceTimes.map((s, i) => (
                      <Flex key={s._key ?? i} gap={3} align="center" wrap="wrap">
                        <Text size={2}>
                          {capitalize(s.day)} {niceTime(s.time)}: {s.label ?? '(no name)'}
                          {s.note ? ` (${s.note})` : ''}
                        </Text>
                        <ToConfirm confirmed={s.confirmed} />
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <Text size={2} muted>
                    None yet.
                  </Text>
                )}
              </Row>

              <Row label="Address">
                <Flex gap={3} align="center" wrap="wrap">
                  <Text size={2}>{address || 'Not filled in yet.'}</Text>
                  {address ? <ToConfirm confirmed={a?.confirmed} /> : null}
                </Flex>
                {a?.findUs ? (
                  <Text size={1} muted>
                    {a.findUs}
                  </Text>
                ) : null}
              </Row>

              <Row label="Contact">
                <Text size={2}>{facts.email || 'No email address yet.'}</Text>
                {facts.phone ? <Text size={2}>{facts.phone}</Text> : null}
              </Row>

              <Row label="Also connected">
                <Text size={2}>
                  YouTube channel: {facts.hasYoutube ? 'yes' : 'not yet'}. Church Trac calendar:{' '}
                  {facts.hasCalendar ? 'yes' : 'not yet'}.
                  {facts.foundedYear ? ` Founded ${facts.foundedYear}.` : ''}
                </Text>
              </Row>
            </Stack>
          </Card>
        )}

        <Box>
          <Text size={2}>
            <IntentLink intent="edit" params={{ id: 'siteSettings', type: 'siteSettings' }}>
              Open Site settings to change these
            </IntentLink>
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
