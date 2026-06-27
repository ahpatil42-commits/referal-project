const DANGEROUS_BLOCK_RE =
  /<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const TAG_RE = /<[^>]*>/g;
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function stripMarkup(value: string): string {
  return value
    .replace(DANGEROUS_BLOCK_RE, "")
    .replace(TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return escapeHtml(stripMarkup(html));
}

export function sanitizeText(text: string): string {
  if (!text) return "";
  return stripMarkup(text);
}
