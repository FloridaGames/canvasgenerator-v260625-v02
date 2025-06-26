
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
  
  // Generate HTML files for uploaded documents as pages
  courseData.documents.forEach((document, index) => {
    const sanitizedTitle = sanitizeFileName(document.name.replace(/\.[^/.]+$/, ''));
    const expectedFilename = `${sanitizedTitle}.html`;
    
    // Create a wiki page object for the document
    const documentPage = {
      id: `doc_${document.id}`,
      title: document.name.replace(/\.[^/.]+$/, ''),
      content: generateDocumentPageContent(document),
      order: courseData.pages.length + index + 1,
      isPublished: true
    };
    
    const pageHtml = generateCanvasWikiPageHTML(documentPage);
    zip.file(`wiki_content/${expectedFilename}.html`, pageHtml);
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

const generateDocumentPageContent = (document: any): string => {
  return `<div class="document-content">
  <h2>Document: ${document.name}</h2>
  <p>This page was created from an uploaded document.</p>
  <div class="document-info">
    <p><strong>File Type:</strong> ${document.name.split('.').pop()?.toUpperCase() || 'Unknown'}</p>
    <p><strong>Size:</strong> ${formatFileSize(document.file?.size || 0)}</p>
  </div>
  <div class="document-actions">
    <p>You can edit this content or add additional information as needed.</p>
  </div>
</div>`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
