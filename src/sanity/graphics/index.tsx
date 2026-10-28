// Safe to edit by hand
// =============================================================================
// auburnGraphics: the "Make a graphic" tool and its document action (2026-10-27)
// =============================================================================
// Register it in sanity.config.ts BEFORE ncsStudioKit, so the kit's tool order and
// staff view (src/sanity/kit.config.ts: 'graphics' in toolOrder and staffTools)
// place it. The tool is GraphicsTool.tsx; the action opens it on a sermon, a
// series or a page. docs/agent/graphics.md.
// =============================================================================
import { definePlugin, useWorkspace, type DocumentActionComponent } from 'sanity';
import { useRouter } from 'sanity/router';
import { ImageIcon } from '@sanity/icons/Image';
import { GraphicsTool, GRAPHICS_DOC_KEY } from './GraphicsTool';

export const GRAPHICS_TOOL = 'graphics';

/** Types the action appears on: their words prefill the tool. */
const GRAPHIC_TYPES = new Set(['sermon', 'sermonSeries', 'page']);

/**
 * "Make a graphic" in a document's menu. Opens the tool on this document; a
 * page without an Event details block opens the tool on its first screen.
 */
export const makeGraphicAction: DocumentActionComponent = (props) => {
  const router = useRouter();
  const { basePath } = useWorkspace();
  if (!GRAPHIC_TYPES.has(props.type)) return null;
  const id = props.id.replace(/^drafts\./, '');
  return {
    label: 'Make a graphic',
    icon: ImageIcon,
    disabled: !props.published,
    title: props.published
      ? 'Make posts, slides and flyers from this, in the church’s own look.'
      : 'Publish it first. Graphics use the published words.',
    onHandle: () => {
      // The deployed Studio is hash-routed (src/sanity/kit/shared.tsx), so the document id
      // travels in sessionStorage and the move goes through the router.
      try {
        sessionStorage.setItem(GRAPHICS_DOC_KEY, id);
      } catch {
        // Private mode: the tool opens on its first screen instead.
      }
      // basePath is "/" in the hash-routed deploy, so join without doubling the slash.
      router.navigateUrl({ path: `${basePath.replace(/\/+$/, '')}/${GRAPHICS_TOOL}` });
    },
  };
};

export const auburnGraphics = definePlugin({
  name: 'auburn-graphics',
  tools: (prev) =>
    prev.some((t) => t.name === GRAPHICS_TOOL)
      ? prev
      : [
          ...prev,
          {
            name: GRAPHICS_TOOL,
            title: 'Make a graphic',
            icon: ImageIcon,
            component: GraphicsTool,
          },
        ],
});
