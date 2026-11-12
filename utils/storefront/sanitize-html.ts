/**
 * Conservative clean-up for admin-authored policy HTML before it is rendered:
 * drops script/style/iframe/object/embed/form blocks, inline event handlers
 * and javascript: URLs. Policy text is written by staff, so this is a
 * defence-in-depth step, not a general-purpose sanitiser.
 */
const BLOCKED_ELEMENTS = /<(script|style|iframe|object|embed|form|link|meta)\b[\s\S]*?(?:<\/\1\s*>|\/?>)/gi;
const EVENT_HANDLERS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_URLS = /(href|src)\s*=\s*(["']?)\s*(?:javascript|vbscript|data):[^"'\s>]*\2/gi;
const HTML_TAG = /<\/?[a-z][\s\S]*?>/i;

export function sanitizePolicyHtml(html: string): string {
  return html.replace(BLOCKED_ELEMENTS, "").replace(EVENT_HANDLERS, "").replace(SCRIPT_URLS, '$1="#"');
}

export function looksLikeHtml(text: string): boolean {
  return HTML_TAG.test(text);
}
