import JSZip from 'jszip';
import { CourseData } from '@/components/CourseCreator';
import { generateCanvasWikiPageHTML, generateCanvasIdentifier } from './wikiPageGenerator';

export const generateIMSCC = async (courseData: CourseData): Promise<Blob> => {
  const zip = new JSZip();
  
  // Generate manifest file
  const manifest = generateManifest(courseData);
  zip.file('imsmanifest.xml', manifest);
  
  // Generate course settings
  const courseSettings = generateCourseSettings(courseData);
  zip.file('course_settings/course_settings.xml', courseSettings);
  
  // Generate front page HTML with proper identifier
  const frontPageIdentifier = 'g' + 'frontpage'.padEnd(31, '0') + '1';
  const frontPageHtml = generateCanvasPageHTML(courseData.frontPage.title, courseData.frontPage.content, frontPageIdentifier);
  zip.file('wiki_content/front-page.html', frontPageHtml);
  
  // Generate individual wiki pages HTML using the new generator
  courseData.pages.forEach((page, index) => {
    const pageHtml = generateCanvasWikiPageHTML(page);
    const sanitizedTitle = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    zip.file(`wiki_content/${sanitizedTitle}.html`, pageHtml);
  });
  
  // Generate module structure
  const moduleContent = generateModuleStructure(courseData);
  zip.file('course_settings/module_meta.xml', moduleContent);
  
  // Generate wiki page metadata
  const wikiMetadata = generateWikiMetadata(courseData);
  zip.file('course_settings/wiki_content.xml', wikiMetadata);
  
  // Create the actual ZIP file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  return zipBlob;
};

const generateManifest = (courseData: CourseData): string => {
  const frontPageIdentifier = 'g' + 'frontpage'.padEnd(31, '0') + '1';
  
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
        ${courseData.pages.map((page) => {
          const identifier = generateCanvasIdentifier(page.id, page.title);
          return `
        <item identifier="wiki_item_${identifier}">
          <title>${escapeXml(page.title)}</title>
          <identifierref>${identifier}</identifierref>
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
    ${courseData.pages.map((page) => {
      const identifier = generateCanvasIdentifier(page.id, page.title);
      const sanitizedTitle = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return `
    <resource identifier="${identifier}" type="webcontent" href="wiki_content/${sanitizedTitle}.html">
      <file href="wiki_content/${sanitizedTitle}.html"/>
    </resource>`;
    }).join('')}
  </resources>
</manifest>`;
};

const generateCourseSettings = (courseData: CourseData): string => {
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

const generateWikiMetadata = (courseData: CourseData): string => {
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

const generateCanvasPageHTML = (title: string, content: string, identifier?: string): string => {
  // Clean and format the content for Canvas
  const cleanContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/style\s*=\s*"[^"]*"/gi, '') // Remove inline styles that might conflict
    .replace(/class\s*=\s*"([^"]*)"/gi, (match, className) => {
      // Keep only safe CSS classes
      const safeClasses = className.split(' ').filter((cls: string) => 
        /^(text-|bg-|p-|m-|border-|rounded|flex|grid|col-|row-|w-|h-|max-|min-)/.test(cls) ||
        /^(btn|card|alert|table|list|nav)/.test(cls)
      );
      return safeClasses.length > 0 ? `class="${safeClasses.join(' ')}"` : '';
    });

  return `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>${escapeXml(title)}</title>${identifier ? `
<meta name="identifier" content="${identifier}"/>` : ''}
<meta name="editing_roles" content="teachers"/>
<meta name="workflow_state" content="active"/>
</head>
<body>
${cleanContent}
</body>
</html>`;
};

const generateModuleStructure = (courseData: CourseData): string => {
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
        return `
      <item identifier="module_item_${identifier}">
        <title>${escapeXml(page.title)}</title>
        <position>${index + 1}</position>
        <content_type>WikiPage</content_type>
        <identifierref>${identifier}</identifierref>
        <published>${page.isPublished ? 'true' : 'false'}</published>
        <workflow_state>${page.isPublished ? 'active' : 'unpublished'}</workflow_state>
      </item>`;
      }).join('')}
    </items>
  </module>
</modules>`;
};

const escapeXml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
