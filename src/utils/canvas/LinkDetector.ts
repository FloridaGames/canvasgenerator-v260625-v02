
export class LinkDetector {
  static isRelativeLink(href: string): boolean {
    return !href.match(/^https?:\/\//) && !href.match(/^mailto:/) && !href.match(/^tel:/);
  }

  static isPageLink(href: string): boolean {
    return href.includes('.html') || href.includes('/pages/') || href.match(/^[^\/]+$/) !== null;
  }

  static isFileLink(href: string): boolean {
    return href.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt)$/i) !== null;
  }

  static extractPageName(href: string): string {
    return href.replace(/\.html$/, '').replace(/^.*\//, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  static extractFileName(href: string): string {
    return href.replace(/^.*\//, '');
  }
}
