
import { WikiPage } from '@/components/CourseCreator';

export const generateCanvasWikiPageHTML = (page: WikiPage): string => {
  // Generate Canvas LMS compliant identifier
  const identifier = generateCanvasIdentifier(page.id, page.title);
  
  // Clean and format the content for Canvas
  const cleanContent = cleanHTMLContent(page.content);
  
  return `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>${escapeHtml(page.title)}</title>
<meta name="identifier" content="${identifier}"/>
<meta name="editing_roles" content="teachers"/>
<meta name="workflow_state" content="${page.isPublished ? 'active' : 'unpublished'}"/>
</head>
<body>
${cleanContent}
</body>
</html>`;
};

export const generateCanvasIdentifier = (pageId: string, title: string): string => {
  // Create a Canvas LMS compliant identifier
  // Format: g + 32 character hex string (similar to Canvas page identifiers)
  const baseString = `${pageId}_${title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Create a simple hash-like identifier (Canvas uses 32 char hex)
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex and pad to 32 characters
  const hexHash = Math.abs(hash).toString(16).padEnd(32, '0').substring(0, 32);
  return `g${hexHash}`;
};

const cleanHTMLContent = (content: string): string => {
  if (!content) return '<p>No content available</p>';
  
  // Remove any script tags and style tags for security
  let cleanContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
  // Clean up any div wrappers that might contain Canvas-specific styling
  cleanContent = cleanContent
    .replace(/<div[^>]*style="[^"]*"[^>]*>/gi, '<div>')
    .replace(/style\s*=\s*"[^"]*"/gi, '');
    
  // Ensure we have proper paragraph structure
  if (!cleanContent.includes('<p') && !cleanContent.includes('<h') && !cleanContent.includes('<div')) {
    cleanContent = `<p>${cleanContent}</p>`;
  }
  
  return cleanContent;
};

const escapeHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Note: Download functions removed to prevent file system writes
// HTML content is now only generated for inclusion in IMSCC packages
