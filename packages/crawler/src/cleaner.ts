interface CleanedHtml {
  text: string;
  html: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMainContent(html: string): string {
  const articleMatch = html.match(
    /<article[^>]*>([\s\S]*?)<\/article>/i
  );
  if (articleMatch) return articleMatch[1];

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];

  const contentMatch = html.match(
    /<div[^>]*class="[^"]*(?:content|article|post|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (contentMatch) return contentMatch[1];

  return html;
}

export function cleanHtml(rawHtml: string): CleanedHtml {
  const mainContent = extractMainContent(rawHtml);
  const text = stripTags(mainContent);

  const cleanedHtml = mainContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  return { text, html: cleanedHtml };
}
