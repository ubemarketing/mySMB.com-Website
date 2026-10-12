# mySMB.com Studio

Install with `pnpm install --frozen-lockfile`. Run `pnpm dev` locally, `pnpm build` to verify, and `pnpm deploy` after authenticating with Sanity. The hosted app is the existing mySMB.com Studio.

## Legal documents

Choose **Legal documents**, then the document. Each item has a format (heading, paragraph, bullet, numbered item or lettered clause), an indentation level, and rich text for emphasis and links. Lettered clauses keep their labels separate so wrapping stays aligned. Add a separate item for each paragraph; Shift+Enter inserts a line break. Numbered list items should remain together.

The **Preview** tab shows current draft edits at phone, tablet or desktop widths. Review wording, numbering, cross-references and the effective date before publishing. Publishing updates the public page once the reviewed website CMS connection is live. Drafts are never loaded on the public website.

The approved HTML remains a fallback if Sanity is unavailable or its document is incomplete. Use the Legal documents editor for document bodies; Website pages retains the page hero, navigation and footer fields.

`legal-documents.ndjson` contains the three approved originals. Initial seeding uses createIfNotExists; never replace an existing edited document with this seed.
