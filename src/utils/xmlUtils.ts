export const escapeXml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const cleanHTMLForCanvas = (content: string): string => {
  if (!content) return '';
  
  // Remove any script tags and style tags for security
  let cleanContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
  // Clean up any div wrappers that might contain Canvas-specific styling
  cleanContent = cleanContent
    .replace(/<div[^>]*style="[^"]*"[^>]*>/gi, '<div>')
    .replace(/style\s*=\s*"[^"]*"/gi, '');
    
  // Keep only safe CSS classes
  cleanContent = cleanContent.replace(/class\s*=\s*"([^"]*)"/gi, (match, className) => {
    const safeClasses = className.split(' ').filter((cls: string) => 
      /^(text-|bg-|p-|m-|border-|rounded|flex|grid|col-|row-|w-|h-|max-|min-)/.test(cls) ||
      /^(btn|card|alert|table|list|nav)/.test(cls)
    );
    return safeClasses.length > 0 ? `class="${safeClasses.join(' ')}"` : '';
  });
  
  return cleanContent;
};
