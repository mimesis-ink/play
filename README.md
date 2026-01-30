# Play - Fumadocs Website

This is a documentation website built with [Fumadocs](https://fumadocs.dev/), a beautiful & flexible React.js docs framework powered by Next.js.

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Claude AI Settings Collection

This project includes a comprehensive settings collection optimized for Claude AI to efficiently read and understand the novel content.

### API Endpoints

- **`/llms-settings.txt`** - Complete settings collection (world-building, characters, plot summary, timeline)
- **`/llms-full.txt`** - All chapter contents
- **`/llms.mdx/docs/[[...slug]]`** - Individual chapter access

### Settings Documents

Located in `/content/docs/appendix/`:

- **`settings.mdx`** - World-building and character settings
- **`plot-summary.mdx`** - Complete plot summary with chapter guide
- **`characters.mdx`** - Character psychology analysis
- **`timeline-reference.mdx`** - Complete timeline reference

For detailed usage instructions, see [CLAUDE_SETTINGS_README.md](./CLAUDE_SETTINGS_README.md).

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
