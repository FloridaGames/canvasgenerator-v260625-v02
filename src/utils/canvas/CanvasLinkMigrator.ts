
import { HTMLCleaner } from './HTMLCleaner';
import { CanvasFormatter } from './CanvasFormatter';
import { LinkMigrator, LinkMigrationOptions } from './LinkMigrator';

export interface MigrationResult {
  html: string;
  issues: string[];
  migrated_links: number;
}

export { LinkMigrationOptions };

export class CanvasLinkMigrator {
  private options: LinkMigrationOptions;
  private linkMigrator: LinkMigrator;

  constructor(options: LinkMigrationOptions = {}) {
    this.options = {
      flavor: 'canvas',
      ...options
    };
    this.linkMigrator = new LinkMigrator(options);
  }

  migrateContent(html: string): MigrationResult {
    const allIssues: string[] = [];
    let totalMigratedLinks = 0;

    // Clean up common problematic HTML patterns
    let migratedHtml = HTMLCleaner.cleanProblematicHTML(html);
    
    // Fix relative links and convert them to Canvas format
    const linkResult = this.linkMigrator.fixRelativeLinks(migratedHtml);
    migratedHtml = linkResult.html;
    allIssues.push(...linkResult.issues);
    totalMigratedLinks += linkResult.migratedLinks;
    
    // Convert file references to Canvas file format
    const fileResult = this.linkMigrator.convertFileReferences(migratedHtml);
    migratedHtml = fileResult.html;
    allIssues.push(...fileResult.issues);
    totalMigratedLinks += fileResult.migratedLinks;
    
    // Fix image references
    const imageResult = this.linkMigrator.fixImageReferences(migratedHtml);
    migratedHtml = imageResult.html;
    allIssues.push(...imageResult.issues);
    totalMigratedLinks += imageResult.migratedLinks;
    
    // Fix heading structure for Canvas
    migratedHtml = HTMLCleaner.fixHeadingStructure(migratedHtml, allIssues);
    
    // Clean up Canvas-specific formatting
    migratedHtml = CanvasFormatter.applyCanvasFormatting(migratedHtml, allIssues);

    return {
      html: migratedHtml,
      issues: allIssues,
      migrated_links: totalMigratedLinks
    };
  }
}

export const migrateCanvasContent = (html: string, options?: LinkMigrationOptions): MigrationResult => {
  const migrator = new CanvasLinkMigrator(options);
  return migrator.migrateContent(html);
};
