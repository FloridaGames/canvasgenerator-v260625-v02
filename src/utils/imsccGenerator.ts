
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
  
  // Generate front page
  const frontPageHtml = generateCanvasPage(courseData.frontPage.title, courseData.frontPage.content);
  zip.file('web_resources/front_page.html', frontPageHtml);
  
  // Generate wiki pages
  courseData.pages.forEach((page, index) => {
    const pageHtml = generateCanvasPage(page.title, page.content);
    zip.file(`web_resources/page_${page.id}.html`, pageHtml);
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
  const pageResources = courseData.pages.map((page) => `
    <resource identifier="page_${page.id}" type="webcontent" href="web_resources/page_${page.id}.html">
      <file href="web_resources/page_${page.id}.html"/>
      <metadata>
        <lom:lom xmlns:lom="http://ltsc.ieee.org/xsd/LOM">
          <lom:general>
            <lom:title>
              <lom:string language="en">${escapeXml(page.title)}</lom:string>
            </lom:title>
          </lom:general>
        </lom:lom>
      </metadata>
    </resource>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="course_${Date.now()}" 
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
      <item identifier="front_page" identifierref="front_page_resource">
        <title>Course Home</title>
      </item>
      <item identifier="pages_module">
        <title>Course Pages</title>
        ${courseData.pages.map((page) => `
        <item identifier="page_${page.id}" identifierref="page_${page.id}">
          <title>${escapeXml(page.title)}</title>
        </item>`).join('')}
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="front_page_resource" type="webcontent" href="web_resources/front_page.html">
      <file href="web_resources/front_page.html"/>
    </resource>
    ${pageResources}
    <resource identifier="course_settings" type="course_settings" href="course_settings/course_settings.xml">
      <file href="course_settings/course_settings.xml"/>
    </resource>
    <resource identifier="wiki_content" type="course_settings" href="course_settings/wiki_content.xml">
      <file href="course_settings/wiki_content.xml"/>
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
      <body>${escapeXml(courseData.frontPage.content)}</body>
      <editing_roles>teachers</editing_roles>
      <notify_of_update>false</notify_of_update>
      <published>${courseData.frontPage.content ? 'true' : 'false'}</published>
      <front_page>true</front_page>
    </page>
    ${courseData.pages.map(page => `
    <page identifier="page_${page.id}">
      <title>${escapeXml(page.title)}</title>
      <body>${escapeXml(page.content)}</body>
      <editing_roles>teachers</editing_roles>
      <notify_of_update>false</notify_of_update>
      <published>${page.isPublished ? 'true' : 'false'}</published>
      <front_page>false</front_page>
    </page>`).join('')}
  </pages>
</wiki_content>`;
};

const generateCanvasPage = (title: string, content: string): string => {
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
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2D3B45;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { 
            font-size: 2em; 
            border-bottom: 2px solid #394B59; 
            padding-bottom: 10px; 
        }
        h2 { 
            font-size: 1.5em; 
            color: #2980B9; 
        }
        h3 { 
            font-size: 1.3em; 
        }
        a { 
            color: #2980B9; 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
        .course-welcome, .course-info, .course-navigation, .getting-started {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #3182ce;
        }
        .page-list { 
            list-style-type: none; 
            padding: 0; 
        }
        .page-list li {
            margin: 10px 0;
            padding: 8px 12px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .page-list a {
            color: #3182ce;
            text-decoration: none;
            font-weight: 500;
        }
        .page-list a:hover { 
            text-decoration: underline; 
        }
        img {
            max-width: 100%;
            height: auto;
        }
        .canvas-content {
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="canvas-content">
        ${content}
    </div>
</body>
</html>`;
};

const generateModuleStructure = (courseData: CourseData): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<modules xmlns="http://canvas.instructure.com/xsd/cccv1p0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <module identifier="course_pages_module">
    <title>Course Content</title>
    <position>1</position>
    <require_sequential_progress>false</require_sequential_progress>
    <publish_final_grade>false</publish_final_grade>
    
    <items>
      ${courseData.pages.map((page, index) => `
      <item identifier="page_item_${page.id}">
        <title>${escapeXml(page.title)}</title>
        <position>${index + 1}</position>
        <content_type>WikiPage</content_type>
        <identifierref>page_${page.id}</identifierref>
        <published>${page.isPublished ? 'true' : 'false'}</published>
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
