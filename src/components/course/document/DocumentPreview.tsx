
import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentPreviewProps {
  content: string;
  isEmbedded?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  isEmbedded = false
}) => {
  if (!content) {
    if (isEmbedded) return null;
    
    return (
      <div className="text-center text-gray-500 py-20">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Upload a document to see the preview</p>
      </div>
    );
  }

  const containerClass = isEmbedded 
    ? "border rounded-lg p-4 bg-white max-h-60 overflow-y-auto" 
    : "p-4 overflow-y-auto";

  return (
    <div className={containerClass}>
      {isEmbedded && (
        <div className="text-sm text-gray-600 mb-2">Preview:</div>
      )}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
