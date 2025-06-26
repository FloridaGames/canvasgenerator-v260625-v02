
export class HTMLCleaner {
  static cleanProblematicHTML(html: string): string {
    // Remove problematic styles and scripts
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/style\s*=\s*"[^"]*"/gi, '')
      .replace(/class\s*=\s*"[^"]*"/gi, '');

    // Fix common encoding issues
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');

    // Remove empty paragraphs and divs
    cleaned = cleaned
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      .replace(/<div[^>]*>\s*<\/div>/gi, '');

    return cleaned;
  }

  static fixHeadingStructure(html: string, issues: string[]): string {
    // Ensure proper heading hierarchy for Canvas accessibility
    let headingLevel = 1;
    const headingPattern = /<(h[1-6])[^>]*>/gi;
    
    return html.replace(headingPattern, (match, tag) => {
      const level = parseInt(tag.charAt(1));
      if (level > headingLevel + 1) {
        // Skip levels - Canvas accessibility requires proper hierarchy
        issues.push(`Heading level ${level} follows h${headingLevel} - consider fixing heading hierarchy`);
      }
      headingLevel = level;
      return match;
    });
  }
}
