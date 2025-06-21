import JSZip from 'jszip';
import { CourseData } from '@/components/CourseCreator';

export const generateIMSCC = async (courseData: CourseData): Promise<Blob> => {
  const zip = new JSZip();
  
  // Generate manifest file
  const manifest = generateManifest(courseData);
  zip.file('imsmanifest.xml', manifest);
  
  // Generate course settings
  const courseSettings = generateCourseSettings(courseData);
  zip.file('course_settings/course_settings.xml', courseSettings);
  
  // Generate front page HTML in wiki_content folder
  const frontPageHtml = generateCanvasPageHTML(courseData.frontPage.title, courseData.frontPage.content);
  zip.file('wiki_content/front-page.html', frontPageHtml);
  
  // Generate wiki pages HTML in wiki_content folder
  courseData.pages.forEach((page, index) => {
    const pageHtml = generateCanvasPageHTML(page.title, page.content);
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
  const pageResources = courseData.pages.map((page) => {
    const sanitizedTitle = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `
    <resource identifier="wiki_content_${page.id}" type="webcontent" href="wiki_content/${sanitizedTitle}.html">
      <file href="wiki_content/${sanitizedTitle}.html"/>
      <metadata>
        <lom:lom xmlns:lom="http://ltsc.ieee.org/xsd/LOM">
          <lom:general>
            <lom:title>
              <lom:string language="en">${escapeXml(page.title)}</lom:string>
            </lom:title>
          </lom:general>
        </lom:lom>
      </metadata>
    </resource>`;
  }).join('');

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
      <item identifier="front_page_item" identifierref="front_page_resource">
        <title>Course Home</title>
      </item>
      <item identifier="pages_module" structure="rooted-hierarchy">
        <title>Wiki Pages</title>
        ${courseData.pages.map((page) => `
        <item identifier="wiki_item_${page.id}" identifierref="wiki_content_${page.id}">
          <title>${escapeXml(page.title)}</title>
        </item>`).join('')}
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="front_page_resource" type="webcontent" href="wiki_content/front-page.html">
      <file href="wiki_content/front-page.html"/>
    </resource>
    ${pageResources}
    <resource identifier="course_settings_resource" type="course_settings" href="course_settings/course_settings.xml">
      <file href="course_settings/course_settings.xml"/>
    </resource>
    <resource identifier="wiki_content_resource" type="course_settings" href="course_settings/wiki_content.xml">
      <file href="course_settings/wiki_content.xml"/>
    </resource>
    <resource identifier="module_meta_resource" type="course_settings" href="course_settings/module_meta.xml">
      <file href="course_settings/module_meta.xml"/>
    </resource>
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<wiki_content xmlns="http://canvas.instructure.com/xsd/cccv1p0"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <pages>
    <page identifier="front_page">
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
      return `
    <page identifier="wiki_page_${page.id}">
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

const generateCanvasPageHTML = (title: string, content: string): string => {
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

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeXml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #2D3B45;
            margin: 0;
            padding: 20px;
            background: #ffffff;
        }
        .content-wrapper {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2D3B45;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            font-weight: 600;
        }
        h1 { 
            font-size: 2em; 
            border-bottom: 2px solid #394B59; 
            padding-bottom: 10px; 
            margin-bottom: 1em;
        }
        h2 { 
            font-size: 1.5em; 
            color: #2980B9; 
            margin-bottom: 0.75em;
        }
        h3 { 
            font-size: 1.3em; 
            margin-bottom: 0.5em;
        }
        p {
            margin-bottom: 1em;
            text-align: left;
        }
        a { 
            color: #2980B9; 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
        .grid-row {
            display: flex;
            flex-wrap: wrap;
            margin: -12px;
        }
        .col-xs-12 {
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
        }
        .col-md-1 { width: 8.333%; }
        .col-md-2 { width: 16.666%; }
        .col-md-3 { width: 25%; }
        .col-md-4 { width: 33.333%; }
        .col-md-5 { width: 41.666%; }
        .col-md-6 { width: 50%; }
        .col-md-7 { width: 58.333%; }
        .col-md-8 { width: 66.666%; }
        .col-md-9 { width: 75%; }
        .col-md-10 { width: 83.333%; }
        .col-md-11 { width: 91.666%; }
        .col-md-12 { width: 100%; }
        
        @media (max-width: 768px) {
            .grid-row > div {
                width: 100% !important;
            }
        }
        
        .course-info, .course-navigation, .getting-started {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #3182ce;
        }
        
        ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
        }
        
        li {
            margin-bottom: 0.5em;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
        
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background: #3182ce;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            background: #2c5aa0;
            text-decoration: none;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1em;
        }
        
        th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        blockquote {
            margin: 1em 0;
            padding: 15px 20px;
            background: #f8f9fa;
            border-left: 4px solid #3182ce;
            font-style: italic;
        }
        
        code {
            background: #f1f3f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        pre {
            background: #f1f3f4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin-bottom: 1em;
        }
    </style>
</head>
<body>
    <div class="content-wrapper">
        ${cleanContent}
    </div>
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
      ${courseData.pages.map((page, index) => `
      <item identifier="module_item_${page.id}">
        <title>${escapeXml(page.title)}</title>
        <position>${index + 1}</position>
        <content_type>WikiPage</content_type>
        <identifierref>wiki_content_${page.id}</identifierref>
        <published>${page.isPublished ? 'true' : 'false'}</published>
        <workflow_state>${page.isPublished ? 'active' : 'unpublished'}</workflow_state>
      </item>`).join('')}
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
