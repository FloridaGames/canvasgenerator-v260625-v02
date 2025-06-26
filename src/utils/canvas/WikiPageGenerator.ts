import JSZip from 'jszip';
import { CourseData, WikiPage } from '@/components/CourseCreator';
import { ResourceManager } from './ResourceManager';
import { generateCanvasPageHTML } from '../canvasPageGenerator';
import { sanitizeFileName } from '../xmlUtils';

export class WikiPageGenerator {
  private courseData: CourseData;
  private resourceManager: ResourceManager;

  constructor(courseData: CourseData, resourceManager: ResourceManager) {
    this.courseData = courseData;
    this.resourceManager = resourceManager;
  }

  async generate(zip: JSZip): Promise<void> {
    // Generate front page
    await this.generateFrontPage(zip);
    
    // Generate wiki pages
    await this.generateWikiPages(zip);
    
    // Generate document pages as WikiPages
    await this.generateDocumentPages(zip);
  }

  private async generateFrontPage(zip: JSZip): Promise<void> {
    const frontPageResource = this.resourceManager.getResource('front_page');
    if (!frontPageResource) return;

    const frontPageHtml = this.generateWikiPageHTML({
      id: 'front_page',
      title: this.courseData.frontPage.title,
      content: this.courseData.frontPage.content,
      order: 0,
      isPublished: true
    }, frontPageResource.identifier);
    
    zip.file(frontPageResource.href, frontPageHtml);
  }

  private async generateWikiPages(zip: JSZip): Promise<void> {
    for (const page of this.courseData.pages) {
      const resource = this.resourceManager.getResource(
        this.generatePageIdentifier(page.id, page.title)
      );
      
      if (resource) {
        const pageHtml = this.generateWikiPageHTML(page, resource.identifier);
        zip.file(resource.href, pageHtml);
      }
    }
  }

  private async generateDocumentPages(zip: JSZip): Promise<void> {
    for (const document of this.courseData.documents) {
      const title = document.name.replace(/\.[^/.]+$/, '');
      const resource = this.resourceManager.getResource(
        this.generatePageIdentifier(`doc_${document.id}`, title)
      );
      
      if (resource) {
        const documentPage = this.createDocumentWikiPage(document, title);
        const pageHtml = this.generateWikiPageHTML(documentPage, resource.identifier);
        zip.file(resource.href, pageHtml);
      }
    }
  }

  private generateWikiPageHTML(page: WikiPage, identifier: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>${this.escapeHtml(page.title)}</title>
<meta name="identifier" content="${identifier}"/>
<meta name="editing_roles" content="teachers"/>
<meta name="workflow_state" content="${page.isPublished ? 'active' : 'unpublished'}"/>
<meta name="wiki_page_menu_tools" content=""/>
</head>
<body>
<div class="show-content user_content clearfix enhanced">
${this.cleanHTMLContent(page.content)}
</div>
</body>
</html>`;
  }

  private createDocumentWikiPage(document: any, title: string): WikiPage {
    return {
      id: `doc_${document.id}`,
      title: title,
      content: this.generateDocumentPageContent(document),
      order: this.courseData.pages.length + 1,
      isPublished: true
    };
  }

  private generateDocumentPageContent(document: any): string {
    return `<div class="document-content">
  <h2>Document: ${this.escapeHtml(document.name)}</h2>
  <p>This page was created from an uploaded document and is now a wiki page in your course.</p>
  <div class="document-info">
    <p><strong>File Type:</strong> ${document.name.split('.').pop()?.toUpperCase() || 'Unknown'}</p>
    <p><strong>Size:</strong> ${this.formatFileSize(document.file?.size || 0)}</p>
  </div>
  <div class="document-actions">
    <p>You can edit this content directly in Canvas or add additional information as needed.</p>
    <p><em>Note: This content is stored as a wiki page, not as a file attachment.</em></p>
  </div>
</div>`;
  }

  private generatePageIdentifier(id: string, title: string): string {
    const baseString = `${id}_${title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hexHash = Math.abs(hash).toString(16).padEnd(32, '0').substring(0, 32);
    return `g${hexHash}`;
  }

  private cleanHTMLContent(content: string): string {
    if (!content) return '<p>No content available</p>';
    
    let cleanContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
    cleanContent = cleanContent
      .replace(/<div[^>]*style="[^"]*"[^>]*>/gi, '<div>')
      .replace(/style\s*=\s*"[^"]*"/gi, '');
      
    if (!cleanContent.includes('<p') && !cleanContent.includes('<h') && !cleanContent.includes('<div')) {
      cleanContent = `<p>${cleanContent}</p>`;
    }
    
    return cleanContent;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
