
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
  
  // Generate individual wiki pages HTML using the new generator
  courseData.pages.forEach((page, index) => {
    const pageHtml = generateCanvasWikiPageHTML(page);
    const sanitizedTitle = sanitizeFileName(page.title);
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
