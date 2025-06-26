
import { CourseData } from '@/components/CourseCreator';
import { generateCanvasIdentifier } from './wikiPageGenerator';
import { escapeXml, sanitizeFileName } from './xmlUtils';

export const generateManifest = (courseData: CourseData): string => {
  const frontPageIdentifier = 'g' + 'frontpage'.padEnd(31, '0') + '1';
  
  // Combine regular pages with document-based pages for manifest
  const allPages = [
    ...courseData.pages,
    ...courseData.documents.map(doc => ({
      id: `doc_${doc.id}`,
      title: doc.name.replace(/\.[^/.]+$/, ''),
      content: '', // Content will be generated elsewhere
      order: courseData.pages.length + 1,
      isPublished: true
    }))
  ];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="course_export_${Date.now()}" 
          xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1"
          xmlns:lom="http://ltsc.ieee.org/xsd/LOM"
          xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p1/LOM"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/xsd/imscc_v1p1.xsd">
  
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lom:lom>
      <lom:general>
        <lom:title>
          <lom:string language="en">${escapeXml(courseData.title)}</lom:string>
        </lom:title>
        <lom:description>
          <lom:string language="en">${escapeXml(courseData.description || '')}</lom:string>
        </lom:description>
      </lom:general>
    </lom:lom>
  </metadata>

  <organizations default="org_1">
    <organization identifier="org_1" structure="rooted-hierarchy">
      <title>${escapeXml(courseData.title)}</title>
      <item identifier="front_page_item">
        <title>Course Home</title>
        <identifierref>${frontPageIdentifier}</identifierref>
      </item>
      <item identifier="pages_module" structure="rooted-hierarchy">
        <title>Wiki Pages</title>
        ${allPages.map((page) => {
          const identifier = generateCanvasIdentifier(page.id, page.title);
          const sanitizedTitle = sanitizeFileName(page.title);
          return `
        <item identifier="${identifier}">
          <title>${escapeXml(page.title)}</title>
          <item identifier="${identifier}_item" identifierref="${identifier}">
            <title>${sanitizedTitle}</title>
          </item>
        </item>`;
        }).join('')}
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="course_settings_resource" type="course_settings" href="course_settings/course_settings.xml">
      <file href="course_settings/course_settings.xml"/>
    </resource>
    <resource identifier="wiki_content_resource" type="course_settings" href="course_settings/wiki_content.xml">
      <file href="course_settings/wiki_content.xml"/>
    </resource>
    <resource identifier="module_meta_resource" type="course_settings" href="course_settings/module_meta.xml">
      <file href="course_settings/module_meta.xml"/>
    </resource>
    <resource identifier="${frontPageIdentifier}" type="webcontent" href="wiki_content/front-page.html">
      <file href="wiki_content/front-page.html"/>
    </resource>
    ${allPages.map((page) => {
      const identifier = generateCanvasIdentifier(page.id, page.title);
      const sanitizedTitle = sanitizeFileName(page.title);
      return `
    <resource identifier="${identifier}" type="webcontent" href="wiki_content/${sanitizedTitle}.html">
      <file href="wiki_content/${sanitizedTitle}.html"/>
    </resource>`;
    }).join('')}
  </resources>
</manifest>`;
};
