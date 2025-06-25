
import JSZip from 'jszip';
import { CourseData } from '@/components/CourseCreator';
import { generateCanvasWikiPageHTML, generateCanvasIdentifier } from './wikiPageGenerator';
import { generateManifest } from './manifestGenerator';
import { generateCourseSettings, generateWikiMetadata, generateModuleStructure } from './courseSettingsGenerator';
import { generateCanvasPageHTML } from './canvasPageGenerator';
import { sanitizeFileName } from './xmlUtils';

// Function to read HTML files from the Files folder
const readHTMLFilesFromFolder = async (): Promise<{[key: string]: string}> => {
  const htmlFiles: {[key: string]: string} = {};
  
  try {
    // Try to access the Files/wiki_content directory
    const response = await fetch('/Files/wiki_content/');
    if (response.ok) {
      const text = await response.text();
      // Parse directory listing to find HTML files
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const links = doc.querySelectorAll('a[href$=".html"]');
      
      // Read each HTML file
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && href.endsWith('.html')) {
          try {
            const fileResponse = await fetch(`/Files/wiki_content/${href}`);
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              htmlFiles[href] = content;
            }
          } catch (error) {
            console.log(`Could not read file ${href}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.log('Could not access Files folder:', error);
  }
  
  return htmlFiles;
};

export const generateIMSCC = async (courseData: CourseData): Promise<Blob> => {
  const zip = new JSZip();
  
  // Read existing HTML files from the Files folder
  const existingHTMLFiles = await readHTMLFilesFromFolder();
  
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
  
  // First, add wiki pages from the existing HTML files
  Object.entries(existingHTMLFiles).forEach(([filename, content]) => {
    // Use the content from the existing HTML file
    zip.file(`wiki_content/${filename}`, content);
  });
  
  // Then, generate individual wiki pages HTML for any pages that don't have corresponding HTML files
  courseData.pages.forEach((page, index) => {
    const sanitizedTitle = sanitizeFileName(page.title);
    const expectedFilename = `${sanitizedTitle}.html`;
    
    // Only generate if we don't already have this file from the Files folder
    if (!existingHTMLFiles[expectedFilename]) {
      const pageHtml = generateCanvasWikiPageHTML(page);
      zip.file(`wiki_content/${expectedFilename}`, pageHtml);
    }
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
