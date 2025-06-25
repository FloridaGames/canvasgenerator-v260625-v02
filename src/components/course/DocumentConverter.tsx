
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutOptions, LayoutOptionsData } from './LayoutOptions';
import { generateCanvasHTML } from '@/utils/canvasLayoutGenerator';
import { DocumentUploadSection } from './document/DocumentUploadSection';
import { PageCreationSection } from './document/PageCreationSection';
import { DocumentPreview } from './document/DocumentPreview';
import { DocumentDownloadSection } from './document/DocumentDownloadSection';
import { convertDocument } from './document/utils';

interface DocumentConverterProps {
  onCreatePage?: (title: string, content: string) => void;
  isEmbedded?: boolean;
}

export const DocumentConverter: React.FC<DocumentConverterProps> = ({ 
  onCreatePage, 
  isEmbedded = false 
}) => {
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptionsData>({
    contentWidth: '100%',
    contentAlignment: 'center',
    columns: 1,
    columnWidths: [12],
    textAlign: 'left'
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setFileName(file.name);
    setPageTitle(file.name.replace(/\.[^/.]+$/, "")); // Set default page title

    try {
      const content = await convertDocument(file);
      setConvertedContent(content);
    } catch (error) {
      console.error('Error converting document:', error);
      setConvertedContent('<p>Error converting document. Please try again.</p>');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadHTML = () => {
    const html = generateCanvasHTML(convertedContent, layoutOptions);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_canvas.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreatePage = () => {
    if (onCreatePage && convertedContent && pageTitle.trim()) {
      const canvasHTML = generateCanvasHTML(convertedContent, layoutOptions);
      onCreatePage(pageTitle, canvasHTML);
      
      // Reset form after creating page
      setConvertedContent('');
      setFileName('');
      setPageTitle('');
      
      console.log('Page created successfully in memory - no file system writes!');
    }
  };

  const finalContent = convertedContent ? generateCanvasHTML(convertedContent, layoutOptions) : '';

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        <DocumentUploadSection
          onFileUpload={handleFileUpload}
          fileName={fileName}
          isConverting={isConverting}
          isEmbedded={true}
        />

        {convertedContent && (
          <LayoutOptions 
            layoutOptions={layoutOptions}
            setLayoutOptions={setLayoutOptions}
          />
        )}

        {convertedContent && onCreatePage && (
          <div className="space-y-4 border-t pt-4">
            <PageCreationSection
              pageTitle={pageTitle}
              setPageTitle={setPageTitle}
              onCreatePage={handleCreatePage}
              hasContent={!!convertedContent}
              isEmbedded={true}
            />
          </div>
        )}

        <DocumentPreview content={finalContent} isEmbedded={true} />
      </div>
    );
  }

  // Full converter interface for standalone use
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
      {/* Left Panel - Controls */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              onFileUpload={handleFileUpload}
              fileName={fileName}
              isConverting={isConverting}
            />
          </CardContent>
        </Card>

        {convertedContent && onCreatePage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Wiki Page</CardTitle>
            </CardHeader>
            <CardContent>
              <PageCreationSection
                pageTitle={pageTitle}
                setPageTitle={setPageTitle}
                onCreatePage={handleCreatePage}
                hasContent={!!convertedContent}
              />
            </CardContent>
          </Card>
        )}

        <LayoutOptions 
          layoutOptions={layoutOptions}
          setLayoutOptions={setLayoutOptions}
        />

        <DocumentDownloadSection
          onDownload={downloadHTML}
          hasContent={!!convertedContent}
        />
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:col-span-2 bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium">Canvas LMS Preview</h3>
        </div>
        <div 
          className="overflow-y-auto"
          style={{ minHeight: '600px', minWidth: '800px' }}
        >
          <DocumentPreview content={finalContent} />
        </div>
      </div>
    </div>
  );
};
