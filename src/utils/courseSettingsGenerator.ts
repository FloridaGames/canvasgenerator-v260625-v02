
import { CourseData } from '@/components/CourseCreator';
import { generateCanvasIdentifier } from './wikiPageGenerator';
import { escapeXml } from './xmlUtils';

export const generateCourseSettings = (courseData: CourseData): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<course xmlns="http://canvas.instructure.com/xsd/cccv1p0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <title>${escapeXml(courseData.title)}</title>
  <course_code>${escapeXml(courseData.code)}</course_code>
  <description>${escapeXml(courseData.description || '')}</description>
  
  ${courseData.startDate ? `<start_at>${courseData.startDate}T00:00:00Z</start_at>` : ''}
  ${courseData.endDate ? `<conclude_at>${courseData.endDate}T23:59:59Z</conclude_at>` : ''}
  
  <syllabus_body>${escapeXml(courseData.frontPage.content)}</syllabus_body>
  <default_view>wiki</default_view>
  <wiki_has_front_page>true</wiki_has_front_page>
  
  <canvas:course_home_sub_navigation_enabled xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">true</canvas:course_home_sub_navigation_enabled>
  <canvas:course_home_view xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">wiki</canvas:course_home_view>
</course>`;
};

export const generateWikiMetadata = (courseData: CourseData): string => {
  const frontPageIdentifier = 'g' + 'frontpage'.padEnd(31, '0') + '1';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<wiki_content xmlns="http://canvas.instructure.com/xsd/cccv1p0"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <pages>
    <page identifier="${frontPageIdentifier}">
      <title>${escapeXml(courseData.frontPage.title)}</title>
      <url>front-page</url>
      <body>${escapeXml(courseData.frontPage.content)}</body>
      <editing_roles>teachers</editing_roles>
      <notify_of_update>false</notify_of_update>
      <published>${courseData.frontPage.content ? 'true' : 'false'}</published>
      <front_page>true</front_page>
      <workflow_state>active</workflow_state>
    </page>
    ${courseData.pages.map(page => {
      const sanitizedTitle = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const identifier = generateCanvasIdentifier(page.id, page.title);
      return `
    <page identifier="${identifier}">
      <title>${escapeXml(page.title)}</title>
      <url>${sanitizedTitle}</url>
      <body>${escapeXml(page.content)}</body>
      <editing_roles>teachers</editing_roles>
      <notify_of_update>false</notify_of_update>
      <published>${page.isPublished ? 'true' : 'false'}</published>
      <front_page>false</front_page>
      <workflow_state>${page.isPublished ? 'active' : 'unpublished'}</workflow_state>
    </page>`;
    }).join('')}
  </pages>
</wiki_content>`;
};

export const generateModuleStructure = (courseData: CourseData): string => {
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
      ${courseData.pages.map((page, index) => {
        const identifier = generateCanvasIdentifier(page.id, page.title);
        const resourceId = Math.floor(Math.random() * 1000000) + 100000; // Generate a random resource ID
        
        return `
      <item identifier="module_item_${identifier}">
        <title>${escapeXml(page.title)}</title>
        <position>${index + 1}</position>
        <content_type>WikiPage</content_type>
        <identifierref>${identifier}</identifierref>
        <published>${page.isPublished ? 'true' : 'false'}</published>
        <workflow_state>${page.isPublished ? 'active' : 'unpublished'}</workflow_state>
        
        <wiki_page>
          <div class="show-content user_content clearfix enhanced" data-resource-type="wiki_page.body" data-resource-id="${resourceId}" data-lti-page-content="true">
            <h1 class="page-title">${escapeXml(page.title)}</h1>
            ${page.content}
            <div id="assign-to-mount-point"></div>
            <div id="choose-editor-mount-point"></div>
          </div>
        </wiki_page>
      </item>`;
      }).join('')}
    </items>
  </module>
</modules>`;
};
