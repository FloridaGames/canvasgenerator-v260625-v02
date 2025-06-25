
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText } from 'lucide-react';

interface DocumentUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
  isConverting: boolean;
  isEmbedded?: boolean;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  onFileUpload,
  fileName,
  isConverting,
  isEmbedded = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => fileInputRef.current?.click()}
        className={`${isEmbedded ? 'w-full' : 'w-full'} bg-blue-600 hover:bg-blue-700`}
        disabled={isConverting}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isConverting ? 'Converting...' : 'Upload Document'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf"
        onChange={onFileUpload}
        className="hidden"
      />
      {fileName && (
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="w-4 h-4 mr-2" />
          {fileName}
        </div>
      )}
    </div>
  );
};
