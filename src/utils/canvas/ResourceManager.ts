
export interface Resource {
  type: string;
  identifier: string;
  title: string;
  href: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export class ResourceManager {
  private resources: Map<string, Resource> = new Map();

  addResource(resource: Resource): void {
    this.resources.set(resource.identifier, resource);
  }

  getResource(identifier: string): Resource | undefined {
    return this.resources.get(identifier);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  getResourcesByType(type: string): Resource[] {
    return this.getAllResources().filter(resource => resource.type === type);
  }

  hasResource(identifier: string): boolean {
    return this.resources.has(identifier);
  }

  generateResourceXml(resource: Resource): string {
    const dependencyFiles = resource.dependencies?.map(dep => `<file href="${dep}"/>`).join('\n    ') || '';
    
    // For WikiPages, use imscc_xmlv1p1/learning-application-resource instead of webcontent
    const resourceType = resource.type === 'wiki_page' ? 'imscc_xmlv1p1/learning-application-resource' : 'webcontent';
    
    return `  <resource identifier="${resource.identifier}" type="${resourceType}" href="${resource.href}">
    <file href="${resource.href}"/>
    ${dependencyFiles}
  </resource>`;
  }
}
