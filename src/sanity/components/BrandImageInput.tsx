// Safe to edit by hand
// =============================================================================
// BrandImageInput - the logo and icon uploads in Site settings, with a preview
// =============================================================================
// (2026-10-26.) Wraps the normal image field and draws, under it, where the
// picture will appear on the website: for the logo, the top bar and the phone
// menu; for the icon, a browser tab, a phone's home screen and the footer. With
// nothing uploaded it shows the brand kit's own files, which is what the site
// is using, so the pastor sees what he would be replacing.
//
// The site picks an upload up at its next build (the publish webhook), so the
// note under the preview says "live in a few minutes". Guard rails (size,
// square) are the field's validation (src/lib/brand-uploads.ts); this file
// only draws.
//
// No new dependencies: @sanity/ui only, and the picture URL is assembled from
// the asset id by hand, as SeoSnippetInput does.
// =============================================================================
import type { ObjectInputProps } from 'sanity';
import { Box, Card, Flex, Stack, Text } from '@sanity/ui';
import brand from '../../../brand/brand.config.json';
import { envVal } from '../urls';
import defaultLogo from '../../assets/logo-light.svg?url';
import defaultIcon from '../../assets/brand/fbc-auburn-icon-full-color.svg?url';
import defaultFooterMark from '../../assets/brand/fbc-auburn-icon-white.svg?url';

const theme = brand.palette.theme as Record<string, string>;
const PAPER = theme['--color-bg'] ?? '#FBF8F3';
const INK = theme['--color-accent'] ?? '#16263D';

/** The CDN address of an uploaded image, from its asset id (image-<id>-<w>x<h>-<ext>). */
function uploadedUrl(value: unknown, width: number): string | null {
  const ref = (value as { asset?: { _ref?: string } } | undefined)?.asset?._ref;
  if (typeof ref !== 'string') return null;
  const parts = ref.split('-');
  if (parts.length < 4 || parts[0] !== 'image') return null;
  const projectId = envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID');
  const dataset = envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production';
  if (!projectId) return null;
  const ext = parts[parts.length - 1];
  const body = parts.slice(1, -1).join('-');
  const size = ext === 'svg' ? '' : `?w=${width}`;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${body}.${ext}${size}`;
}

function Label({ children }: { children: string }) {
  return (
    <Text size={1} muted>
      {children}
    </Text>
  );
}

function LogoPreview({ src }: { src: string }) {
  return (
    <Flex gap={3} wrap="wrap">
      <Stack gap={2} flex={1} style={{ minWidth: 220 }}>
        <Label>The top of every page</Label>
        <Card padding={3} radius={2} shadow={1} style={{ background: PAPER }}>
          <Flex align="center" justify="space-between">
            <img src={src} alt="" style={{ height: 48, width: 'auto', maxWidth: '70%' }} />
            <Box
              style={{ width: 70, height: 10, borderRadius: 5, background: INK, opacity: 0.15 }}
            />
          </Flex>
        </Card>
      </Stack>
      <Stack gap={2} style={{ width: 180 }}>
        <Label>The phone menu</Label>
        <Card padding={3} radius={2} shadow={1} style={{ background: PAPER }}>
          <img src={src} alt="" style={{ height: 36, width: 'auto', maxWidth: '100%' }} />
        </Card>
      </Stack>
    </Flex>
  );
}

function IconPreview({ src, footer }: { src: string; footer: string }) {
  return (
    <Flex gap={3} wrap="wrap">
      <Stack gap={2}>
        <Label>A browser tab</Label>
        <Card padding={2} radius={2} shadow={1} tone="transparent">
          <Flex align="center" gap={2}>
            <img src={src} alt="" width={16} height={16} />
            <Text size={1}>{brand.name}</Text>
          </Flex>
        </Card>
      </Stack>
      <Stack gap={2}>
        <Label>A phone home screen</Label>
        <img
          src={src}
          alt=""
          width={60}
          height={60}
          style={{ borderRadius: 14, background: PAPER, boxShadow: '0 1px 3px rgb(0 0 0 / .25)' }}
        />
      </Stack>
      <Stack gap={2}>
        <Label>The footer</Label>
        <Card padding={3} radius={2} style={{ background: INK }}>
          <img src={footer} alt="" width={48} height={48} style={{ display: 'block' }} />
        </Card>
      </Stack>
    </Flex>
  );
}

function BrandImageInput(props: ObjectInputProps & { kind: 'logo' | 'icon' }) {
  const { kind } = props;
  const logoUrl = uploadedUrl(props.value, 560);
  const iconUrl = uploadedUrl(props.value, 256);
  const uploaded = kind === 'logo' ? logoUrl : iconUrl;
  return (
    <Stack gap={4}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} tone={uploaded ? 'caution' : 'transparent'} border>
        <Stack gap={3}>
          <Text size={1} weight="semibold">
            {uploaded
              ? 'How your upload will look. The website switches to it a few minutes after you publish.'
              : 'Nothing uploaded, so the website uses the brand kit’s files (shown here). They are the recommended ones.'}
          </Text>
          {kind === 'logo' ? (
            <LogoPreview src={logoUrl ?? defaultLogo} />
          ) : (
            <IconPreview src={iconUrl ?? defaultIcon} footer={iconUrl ?? defaultFooterMark} />
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

/** The logo field's input (Site settings > Name and contact). */
export function LogoImageInput(props: ObjectInputProps) {
  return <BrandImageInput {...props} kind="logo" />;
}

/** The square icon field's input. */
export function IconImageInput(props: ObjectInputProps) {
  return <BrandImageInput {...props} kind="icon" />;
}
