
import { escapeXml, cleanHTMLForCanvas } from './xmlUtils';

export const generateCanvasPageHTML = (title: string, content: string, identifier?: string): string => {
  const cleanContent = cleanHTMLForCanvas(content);

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
