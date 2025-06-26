
import { LinkDetector } from './LinkDetector';

export interface LinkMigrationOptions {
  course_id?: string;
  base_url?: string;
  flavor?: 'canvas' | 'bb_learn' | 'moodle';
}

export class LinkMigrator {
  private options: LinkMigrationOptions;
  private issues: string[] = [];
  private migratedLinks = 0;

  constructor(options: LinkMigrationOptions = {}) {
    this.options = {
      flavor: 'canvas',
      ...options
    };
  }

  fixRelativeLinks(html: string): { html: string; issues: string[]; migratedLinks: number } {
    this.issues = [];
    this.migratedLinks = 0;

    // Convert relative links to Canvas format
    const linkPattern = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
    
    const result = html.replace(linkPattern, (match, href) => {
      if (LinkDetector.isRelativeLink(href)) {
        this.migratedLinks++;
        
        // Convert to Canvas page link format
        if (LinkDetector.isPageLink(href)) {
          const pageName = LinkDetector.extractPageName(href);
          return match.replace(href, `/courses/${this.options.course_id || 'COURSE_ID'}/pages/${pageName}`);
        }
        
        // Convert to Canvas file link format
        if (LinkDetector.isFileLink(href)) {
          const fileName = LinkDetector.extractFileName(href);
          return match.replace(href, `/courses/${this.options.course_id || 'COURSE_ID'}/files/FILE_ID/download?wrap=1`);
        }
      }
      
      return match;
    });

    return {
      html: result,
      issues: this.issues,
      migratedLinks: this.migratedLinks
    };
  }

  convertFileReferences(html: string): { html: string; issues: string[]; migratedLinks: number } {
    this.issues = [];
    this.migratedLinks = 0;

    // Convert file references to Canvas format
    const filePattern = /src\s*=\s*["']([^"']+\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx))["']/gi;
    
    const result = html.replace(filePattern, (match, src, ext) => {
      if (LinkDetector.isRelativeLink(src)) {
        this.migratedLinks++;
        const fileName = LinkDetector.extractFileName(src);
        this.issues.push(`File reference found: ${fileName} - will need to be uploaded to Canvas files`);
        return match.replace(src, `/courses/${this.options.course_id || 'COURSE_ID'}/files/FILE_ID/preview`);
      }
      return match;
    });

    return {
      html: result,
      issues: this.issues,
      migratedLinks: this.migratedLinks
    };
  }

  fixImageReferences(html: string): { html: string; issues: string[]; migratedLinks: number } {
    this.issues = [];
    this.migratedLinks = 0;

    // Fix image references for Canvas
    const imgPattern = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    
    const result = html.replace(imgPattern, (match, src) => {
      if (LinkDetector.isRelativeLink(src)) {
        this.migratedLinks++;
        const imageName = LinkDetector.extractFileName(src);
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

    return {
      html: result,
      issues: this.issues,
      migratedLinks: this.migratedLinks
    };
  }
}
