
import { migrateCanvasContent, MigrationResult } from './CanvasLinkMigrator';

export interface ContentProcessingOptions {
  courseId?: string;
  preserveFormatting?: boolean;
  fixAccessibility?: boolean;
  cleanupStyles?: boolean;
}

export class CanvasContentProcessor {
  private options: ContentProcessingOptions;

  constructor(options: ContentProcessingOptions = {}) {
    this.options = {
      preserveFormatting: true,
      fixAccessibility: true,
      cleanupStyles: true,
      ...options
    };
  }

  processContent(html: string): MigrationResult {
    let processedHtml = html;

    // Step 1: Basic HTML cleanup
    if (this.options.cleanupStyles) {
      processedHtml = this.cleanupStyles(processedHtml);
    }

    // Step 2: Fix accessibility issues
    if (this.options.fixAccessibility) {
      processedHtml = this.fixAccessibility(processedHtml);
    }

    // Step 3: Apply Canvas-specific migrations
    const migrationResult = migrateCanvasContent(processedHtml, {
      course_id: this.options.courseId,
      flavor: 'canvas'
    });

    // Step 4: Apply Canvas content standards
    migrationResult.html = this.applyCanvasStandards(migrationResult.html);

    return migrationResult;
  }

  private cleanupStyles(html: string): string {
    // Remove inline styles that might conflict with Canvas theme
    let cleaned = html
      .replace(/style\s*=\s*"[^"]*font-family[^"]*"/gi, '')
      .replace(/style\s*=\s*"[^"]*color\s*:\s*#[^;"]*[^"]*"/gi, '')
      .replace(/style\s*=\s*"[^"]*background[^"]*"/gi, '');

    // Remove empty style attributes
    cleaned = cleaned.replace(/style\s*=\s*"[\s]*"/gi, '');

    return cleaned;
  }

  private fixAccessibility(html: string): string {
    let accessible = html;

    // Add alt attributes to images that don't have them
    accessible = accessible.replace(/<img(?![^>]*alt\s*=)[^>]*>/gi, (match) => {
      return match.replace('<img', '<img alt="Image"');
    });

    // Ensure tables have proper headers
    accessible = accessible.replace(/<table[^>]*>/gi, (match) => {
      if (!match.includes('role=')) {
        return match.replace('<table', '<table role="table"');
      }
      return match;
    });

    // Add proper heading structure
    accessible = this.fixHeadingStructure(accessible);

    return accessible;
  }

  private fixHeadingStructure(html: string): string {
    // This is a simplified version - in practice, you'd want more sophisticated heading analysis
    return html.replace(/<h([1-6])[^>]*>/gi, (match, level) => {
      const headingLevel = parseInt(level);
      // Ensure headings start at appropriate level for Canvas pages
      if (headingLevel === 1) {
        return match.replace('<h1', '<h2');
      }
      return match;
    });
  }

  private applyCanvasStandards(html: string): string {
    let standardized = html;

    // Apply Canvas-specific class names for styling
    standardized = standardized
      .replace(/<blockquote/gi, '<blockquote class="canvas-quote"')
      .replace(/<pre/gi, '<pre class="canvas-code"')
      .replace(/<code/gi, '<code class="canvas-inline-code"');

    // Ensure proper Canvas content wrapper
    if (!standardized.includes('show-content')) {
      standardized = `<div class="show-content user_content clearfix enhanced">${standardized}</div>`;
    }

    return standardized;
  }

  static processForCanvas(html: string, options?: ContentProcessingOptions): MigrationResult {
    const processor = new CanvasContentProcessor(options);
    return processor.processContent(html);
  }
}
