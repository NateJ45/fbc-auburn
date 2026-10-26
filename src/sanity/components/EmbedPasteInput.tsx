// Safe to edit by hand
// =============================================================================
// Paste-and-go for the "Custom code or embed" block (2026-10-26)
// =============================================================================
// One box at the top of the block: the pastor pastes a link or the embed code a
// service gave him, and the block fills itself in. A link (or code that is only
// an iframe) goes in "Web address to show"; other code goes in "Custom code",
// with "Runs directly on the page" switched on when it is a known service's
// script that needs it. Under the box, one sentence says what was recognized
// and how it will show, worked out from the block as it stands now, so it is
// right for blocks made before this box existed too.
//
// The decisions are src/lib/embed-providers.ts; nothing extra is stored.
// =============================================================================
import { useCallback, useState, type ClipboardEvent } from 'react';
import { Button, Card, Flex, Stack, Text, TextArea } from '@sanity/ui';
import { set, unset, type ObjectInputProps } from 'sanity';
import { describePlan, planEmbed, readPaste } from '../../lib/embed-providers';

/** Who approves a new service, in the Studio's words. */
const APPROVER = 'Nathan at the studio';

interface EmbedValue {
  embedUrl?: string;
  embedCode?: string;
  runsOnPage?: boolean;
}

export function EmbedPasteInput(props: ObjectInputProps) {
  const value = (props.value ?? {}) as EmbedValue;
  const [text, setText] = useState('');
  const { onChange } = props;

  const apply = useCallback(
    (pasted: string) => {
      const result = readPaste(pasted);
      if (!result) return;
      onChange([
        result.embedUrl ? set(result.embedUrl, ['embedUrl']) : unset(['embedUrl']),
        result.embedCode ? set(result.embedCode, ['embedCode']) : unset(['embedCode']),
        set(result.runsOnPage, ['runsOnPage']),
      ]);
      setText('');
    },
    [onChange],
  );

  const plan = planEmbed(value);
  const tone =
    plan.kind === 'problem' || (plan.kind === 'box' && plan.blocked)
      ? 'caution'
      : plan.kind === 'none'
        ? 'default'
        : 'positive';

  return (
    <Stack gap={4}>
      <Card padding={3} radius={2} border tone="primary">
        <Stack gap={3}>
          <Text size={1} weight="semibold">
            Paste a link or embed code here
          </Text>
          <TextArea
            rows={3}
            value={text}
            placeholder="Like https://www.youtube.com/watch?v=... or the code a service gave you"
            onChange={(e) => setText(e.currentTarget.value)}
            onPaste={(e: ClipboardEvent<HTMLTextAreaElement>) => {
              const pasted = e.clipboardData.getData('text');
              if (!pasted.trim()) return;
              e.preventDefault();
              apply(pasted);
            }}
          />
          {text.trim() && (
            <Flex>
              <Button text="Use this" tone="primary" onClick={() => apply(text)} />
            </Flex>
          )}
          <Text size={1} muted>
            The block fills itself in below: the right shape for a video, map or podcast, and
            whether it runs on the page.
          </Text>
        </Stack>
      </Card>
      <Card padding={3} radius={2} tone={tone}>
        <Text size={1}>{describePlan(plan, APPROVER)}</Text>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
