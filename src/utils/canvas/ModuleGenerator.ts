import { CourseData } from '@/components/CourseCreator';
import { ResourceManager } from './ResourceManager';
import { escapeXml } from '../xmlUtils';

export class ModuleGenerator {
  private courseData: CourseData;
  private resourceManager: ResourceManager;

  constructor(courseData: CourseData, resourceManager: ResourceManager) {
    this.courseData = courseData;
    this.resourceManager = resourceManager;
  }

  generate(): string {
    const wikiResources = this.resourceManager.getResourcesByType('wiki_page').filter(r => r.identifier !== 'front_page');

    return `<?xml version="1.0" encoding="UTF-8"?>
<modules xmlns="http://canvas.instructure.com/xsd/cccv1p0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <module identifier="wiki_pages_module">
    <title>Course Wiki Pages</title>
    <position>1</position>
    <require_sequential_progress>false</require_sequential_progress>
    <publish_final_grade>false</publish_final_grade>
    <workflow_state>active</workflow_state>
    
    <items>
      ${this.generateModuleItems(wikiResources)}
    </items>
  </module>
</modules>`;
  }

  private generateModuleItems(resources: any[]): string {
    return resources.map((resource, index) => {
      const resourceId = Math.floor(Math.random() * 1000000) + 100000;
      const isPublished = this.getPagePublishedStatus(resource.identifier);
      
      return `
      <item identifier="module_item_${resource.identifier}">
        <title>${escapeXml(resource.title)}</title>
        <position>${index + 1}</position>
        <content_type>WikiPage</content_type>
        <identifierref>${resource.identifier}</identifierref>
        <published>${isPublished ? 'true' : 'false'}</published>
        <workflow_state>${isPublished ? 'active' : 'unpublished'}</workflow_state>
        <canvas:points_possible xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">0</canvas:points_possible>
        <canvas:mastery_paths xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">false</canvas:mastery_paths>
        
        <wiki_page>
          <div class="show-content user_content clearfix enhanced" data-resource-type="wiki_page.body" data-resource-id="${resourceId}" data-lti-page-content="true">
            <h1 class="page-title">${escapeXml(resource.title)}</h1>
            <div id="assign-to-mount-point"></div>
            <div id="choose-editor-mount-point"></div>
          </div>
        </wiki_page>
      </item>`;
    }).join('');
  }

  private getPagePublishedStatus(identifier: string): boolean {
    // Check if this is a regular page
    const page = this.courseData.pages.find(p => 
      this.generatePageIdentifier(p.id, p.title) === identifier
    );
    
    if (page) {
      return page.isPublished;
    }
    
    // Document pages are published by default
    return true;
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
}
