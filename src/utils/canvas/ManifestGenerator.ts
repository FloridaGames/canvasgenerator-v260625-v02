
import { CourseData } from '@/components/CourseCreator';
import { ResourceManager } from './ResourceManager';
import { escapeXml } from '../xmlUtils';

export class ManifestGenerator {
  private courseData: CourseData;
  private resourceManager: ResourceManager;

  constructor(courseData: CourseData, resourceManager: ResourceManager) {
    this.courseData = courseData;
    this.resourceManager = resourceManager;
  }

  generate(): string {
    const identifier = `course_export_${Date.now()}`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" 
          xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1"
          xmlns:lom="http://ltsc.ieee.org/xsd/LOM"
          xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p1/LOM"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/xsd/imscc_v1p1.xsd">
  
  ${this.generateMetadata()}
  ${this.generateOrganizations()}
  ${this.generateResources()}
</manifest>`;
  }

  private generateMetadata(): string {
    return `<metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lom:lom>
      <lom:general>
        <lom:title>
          <lom:string language="en">${escapeXml(this.courseData.title)}</lom:string>
        </lom:title>
        <lom:description>
          <lom:string language="en">${escapeXml(this.courseData.description || '')}</lom:string>
        </lom:description>
      </lom:general>
    </lom:lom>
  </metadata>`;
  }

  private generateOrganizations(): string {
    const frontPageResource = this.resourceManager.getResource('front_page');
    const wikiResources = this.resourceManager.getResourcesByType('wiki_page').filter(r => r.identifier !== 'front_page');

    return `<organizations default="org_1">
    <organization identifier="org_1" structure="rooted-hierarchy">
      <title>${escapeXml(this.courseData.title)}</title>
      ${frontPageResource ? `<item identifier="front_page_item" identifierref="${frontPageResource.identifier}">
        <title>Course Home</title>
      </item>` : ''}
      ${wikiResources.length > 0 ? `<item identifier="pages_module" structure="rooted-hierarchy">
        <title>Wiki Pages</title>
        ${wikiResources.map(resource => `
        <item identifier="${resource.identifier}_item" identifierref="${resource.identifier}">
          <title>${escapeXml(resource.title)}</title>
        </item>`).join('')}
      </item>` : ''}
    </organization>
  </organizations>`;
  }

  private generateResources(): string {
    const resources = this.resourceManager.getAllResources();
    const courseSettingsResource = `  <resource identifier="course_settings_resource" type="course_settings" href="course_settings/course_settings.xml">
    <file href="course_settings/course_settings.xml"/>
  </resource>`;
    
    const moduleMetaResource = `  <resource identifier="module_meta_resource" type="course_settings" href="course_settings/module_meta.xml">
    <file href="course_settings/module_meta.xml"/>
  </resource>`;

    return `<resources>
    ${courseSettingsResource}
    ${moduleMetaResource}
    ${resources.map(resource => this.resourceManager.generateResourceXml(resource)).join('\n    ')}
  </resources>`;
  }
}
