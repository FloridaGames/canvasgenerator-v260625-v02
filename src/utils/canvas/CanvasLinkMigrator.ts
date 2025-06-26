
export interface LinkMigrationOptions {
  course_id?: string;
  base_url?: string;
  flavor?: 'canvas' | 'bb_learn' | 'moodle';
}

export interface MigrationResult {
  html: string;
  issues: string[];
  migrated_links: number;
}

export class CanvasLinkMigrator {
  private options: LinkMigrationOptions;
  private issues: string[] = [];
  private migratedLinks = 0;

  constructor(options: LinkMigrationOptions = {}) {
    this.options = {
      flavor: 'canvas',
      ...options
    };
  }

  migrateContent(html: string): MigrationResult {
    this.issues = [];
    this.migratedLinks = 0;

    let migratedHtml = html;

    // Clean up common problematic HTML patterns
    migratedHtml = this.cleanProblematicHTML(migratedHtml);
    
    // Fix relative links and convert them to Canvas format
    migratedHtml = this.fixRelativeLinks(migratedHtml);
    
    // Convert file references to Canvas file format
    migratedHtml = this.convertFileReferences(migratedHtml);
    
    // Fix image references
    migratedHtml = this.fixImageReferences(migratedHtml);
    
    // Clean up Canvas-specific formatting
    migratedHtml = this.applyCanvasFormatting(migratedHtml);

    return {
      html: migratedHtml,
      issues: this.issues,
      migrated_links: this.migratedLinks
    };
  }

  private cleanProblematicHTML(html: string): string {
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

  private fixRelativeLinks(html: string): string {
    // Convert relative links to Canvas format
    const linkPattern = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
    
    return html.replace(linkPattern, (match, href) => {
      if (this.isRelativeLink(href)) {
        this.migratedLinks++;
        
        // Convert to Canvas page link format
        if (this.isPageLink(href)) {
          const pageName = this.extractPageName(href);
          return match.replace(href, `/courses/${this.options.course_id || 'COURSE_ID'}/pages/${pageName}`);
        }
        
        // Convert to Canvas file link format
        if (this.isFileLink(href)) {
          const fileName = this.extractFileName(href);
          return match.replace(href, `/courses/${this.options.course_id || 'COURSE_ID'}/files/FILE_ID/download?wrap=1`);
        }
      }
      
      return match;
    });
  }

  private convertFileReferences(html: string): string {
    // Convert file references to Canvas format
    const filePattern = /src\s*=\s*["']([^"']+\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx))["']/gi;
    
    return html.replace(filePattern, (match, src, ext) => {
      if (this.isRelativeLink(src)) {
        this.migratedLinks++;
        const fileName = this.extractFileName(src);
        this.issues.push(`File reference found: ${fileName} - will need to be uploaded to Canvas files`);
        return match.replace(src, `/courses/${this.options.course_id || 'COURSE_ID'}/files/FILE_ID/preview`);
      }
      return match;
    });
  }

  private fixImageReferences(html: string): string {
    // Fix image references for Canvas
    const imgPattern = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    
    return html.replace(imgPattern, (match, src) => {
      if (this.isRelativeLink(src)) {
        this.migratedLinks++;
        const imageName = this.extractFileName(src);
        this.issues.push(`Image reference found: ${imageName} - will need to be uploaded to Canvas files`);
        
        // Add Canvas-specific image attributes
        let updatedMatch = match;
        if (!match.includes('data-api-endpoint')) {
          updatedMatch = match.replace('<img', '<img data-api-endpoint="/api/v1/courses/COURSE_ID/files"');
        }
        if (!match.includes('data-api-returntype')) {
          updatedMatch = updatedMatch.replace('<img', '<img data-api-returntype="File"');
        }
        
        return updatedMatch.replace(src, `/courses/${this.options.course_id || 'COURSE_ID'}/files/FILE_ID/preview`);
      }
      return match;
    });
  }

  private applyCanvasFormatting(html: string): string {
    // Wrap content in Canvas-friendly structure
    let formatted = html;

    // Ensure proper Canvas content wrapper
    if (!formatted.includes('show-content') && !formatted.includes('user_content')) {
      formatted = `<div class="show-content user_content clearfix enhanced">${formatted}</div>`;
    }

    // Fix heading structure for Canvas
    formatted = this.fixHeadingStructure(formatted);

    // Add Canvas-specific data attributes where needed
    formatted = this.addCanvasDataAttributes(formatted);

    return formatted;
  }

  private fixHeadingStructure(html: string): string {
    // Ensure proper heading hierarchy for Canvas accessibility
    let headingLevel = 1;
    const headingPattern = /<(h[1-6])[^>]*>/gi;
    
    return html.replace(headingPattern, (match, tag) => {
      const level = parseInt(tag.charAt(1));
      if (level > headingLevel + 1) {
        // Skip levels - Canvas accessibility requires proper hierarchy
        this.issues.push(`Heading level ${level} follows h${headingLevel} - consider fixing heading hierarchy`);
      }
      headingLevel = level;
      return match;
    });
  }

  private addCanvasDataAttributes(html: string): string {
    // Add Canvas-specific data attributes for rich content
    let enhanced = html;

    // Add data attributes to tables for Canvas styling
    enhanced = enhanced.replace(/<table/gi, '<table data-api-endpoint="/api/v1/courses/COURSE_ID" data-api-returntype="Page"');

    // Add data attributes to lists for Canvas enhancement
    enhanced = enhanced.replace(/<ul([^>]*)>/gi, '<ul$1 class="unstyled_list">');
    enhanced = enhanced.replace(/<ol([^>]*)>/gi, '<ol$1 class="styled_list">');

    return enhanced;
  }

  private isRelativeLink(href: string): boolean {
    return !href.match(/^https?:\/\//) && !href.match(/^mailto:/) && !href.match(/^tel:/);
  }

  private isPageLink(href: string): boolean {
    return href.includes('.html') || href.includes('/pages/') || href.match(/^[^\/]+$/);
  }

  private isFileLink(href: string): boolean {
    return href.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt)$/i) !== null;
  }

  private extractPageName(href: string): string {
    return href.replace(/\.html$/, '').replace(/^.*\//, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private extractFileName(href: string): string {
    return href.replace(/^.*\//, '');
  }
}

export const migrateCanvasContent = (html: string, options?: LinkMigrationOptions): MigrationResult => {
  const migrator = new CanvasLinkMigrator(options);
  return migrator.migrateContent(html);
};
