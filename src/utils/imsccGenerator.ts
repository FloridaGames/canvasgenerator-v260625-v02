
import JSZip from 'jszip';
import { CourseData } from '@/components/CourseCreator';
import { generateCanvasWikiPageHTML, generateCanvasIdentifier } from './wikiPageGenerator';
import { generateManifest } from './manifestGenerator';
import { generateCourseSettings, generateWikiMetadata, generateModuleStructure } from './courseSettingsGenerator';
import { generateCanvasPageHTML } from './canvasPageGenerator';
import { sanitizeFileName } from './xmlUtils';

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
  
  // Generate individual wiki pages HTML - all pages go into wiki_content folder inside the IMSCC
  courseData.pages.forEach((page, index) => {
    const sanitizedTitle = sanitizeFileName(page.title);
    const expectedFilename = `${sanitizedTitle}.html`;
    
    // Generate HTML content for each page and place it in wiki_content folder
    const pageHtml = generateCanvasWikiPageHTML(page);
    zip.file(`wiki_content/${expectedFilename}`, pageHtml);
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
