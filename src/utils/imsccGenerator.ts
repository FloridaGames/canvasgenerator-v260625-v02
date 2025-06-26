import { CourseData } from '@/components/CourseCreator';
import { CartridgeCreator } from './canvas/CartridgeCreator';

export const generateIMSCC = async (courseData: CourseData): Promise<Blob> => {
  console.log('Starting IMSCC generation with canvas_cc structure...');
  
  const cartridgeCreator = new CartridgeCreator(courseData);
  const zipBlob = await cartridgeCreator.create();
  
  console.log('IMSCC generation completed successfully');
  return zipBlob;
};

// Keep backward compatibility helper functions
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
