
export class CanvasFormatter {
  static applyCanvasFormatting(html: string, issues: string[]): string {
    // Wrap content in Canvas-friendly structure
    let formatted = html;

    // Ensure proper Canvas content wrapper
    if (!formatted.includes('show-content') && !formatted.includes('user_content')) {
      formatted = `<div class="show-content user_content clearfix enhanced">${formatted}</div>`;
    }

    // Add Canvas-specific data attributes where needed
    formatted = this.addCanvasDataAttributes(formatted);

    return formatted;
  }

  static addCanvasDataAttributes(html: string): string {
    // Add Canvas-specific data attributes for rich content
    let enhanced = html;

    // Add data attributes to tables for Canvas styling
    enhanced = enhanced.replace(/<table/gi, '<table data-api-endpoint="/api/v1/courses/COURSE_ID" data-api-returntype="Page"');

    // Add data attributes to lists for Canvas enhancement
    enhanced = enhanced.replace(/<ul([^>]*)>/gi, '<ul$1 class="unstyled_list">');
    enhanced = enhanced.replace(/<ol([^>]*)>/gi, '<ol$1 class="styled_list">');

    return enhanced;
  }
}
