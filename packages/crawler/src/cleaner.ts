const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "nav",
  "footer",
  "header",
  "aside",
  "iframe",
  "svg",
  "form",
  "button",
  "input",
  "select",
  "textarea",
]);

const BLOCKED_ATTRS = ["onclick", "onerror", "onload", "onmouseover"];

export function extractContent(html: string): { title: string; content: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;

  const cleaned = cleanHtml(bodyHtml);

  return { title, content: cleaned };
}

export function cleanHtml(html: string): string {
  let result = html;

  for (const tag of BLOCKED_TAGS) {
    const regex = new RegExp(`<${tag}[\\s\\S]*?${tag}>`, "gi");
    result = result.replace(regex, " ");
  }

  for (const attr of BLOCKED_ATTRS) {
    result = result.replace(new RegExp(`\\s${attr}="[^"]*"`, "gi"), "");
  }

  result = result.replace(/<br\s*\/?>/gi, "\n");
  result = result.replace(/<\/p>/gi, "\n\n");
  result = result.replace(/<\/div>/gi, "\n");
  result = result.replace(/<\/h[1-6]>/gi, "\n\n");
  result = result.replace(/<\/li>/gi, "\n");
  result = result.replace(/<\/tr>/gi, "\n");
  result = result.replace(/<li[^>]*>/gi, "- ");

  result = result.replace(/<[^>]+>/g, " ");

  result = result.replace(/&nbsp;/g, " ");
  result = result.replace(/&amp;/g, "&");
  result = result.replace(/&lt;/g, "<");
  result = result.replace(/&gt;/g, ">");
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#39;/g, "'");
  result = result.replace(/&\w+;/g, " ");

  result = result.replace(/[ \t]+/g, " ");
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.replace(/^\s+|\s+$/g, "");

  return result;
}
