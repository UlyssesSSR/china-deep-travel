import { marked } from 'marked';

// Articles are authored in Markdown (GFM: tables, task lists, strikethrough).
// Convert to HTML once, server-side, so the article page can inject it safely.
marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderMarkdown(md: string): string {
  if (!md) return '';
  return marked.parse(md) as string;
}
