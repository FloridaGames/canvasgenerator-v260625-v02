
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Plus } from 'lucide-react';
import mammoth from 'mammoth';
import { LayoutOptions, LayoutOptionsData } from './LayoutOptions';
import { generateCanvasHTML } from '@/utils/canvasLayoutGenerator';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setFileName(file.name);
    setPageTitle(file.name.replace(/\.[^/.]+$/, "")); // Set default page title

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setConvertedContent(result.value);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll show a placeholder message
        setConvertedContent(`
          <h2>PDF Document: ${file.name}</h2>
          <p>PDF conversion requires additional server-side processing. This is a placeholder for the converted content.</p>
          <p>In a real implementation, you would use a PDF-to-HTML conversion service.</p>
          <h3>Sample Content</h3>
          <p>This is sample content that demonstrates how your PDF content would appear after conversion. You can customize the layout using the options on the left.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        `);
      }
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
      
      // Show success message or navigate to pages tab
      console.log('Page created successfully!');
    }
  };

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        {/* Simplified Upload Section */}
        <div className="space-y-4">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isConverting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isConverting ? 'Converting...' : 'Upload Document'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileName && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {fileName}
            </div>
          )}
        </div>

        {/* Layout Options */}
        {convertedContent && (
          <LayoutOptions 
            layoutOptions={layoutOptions}
            setLayoutOptions={setLayoutOptions}
          />
        )}

        {/* Page Creation Section */}
        {convertedContent && onCreatePage && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="embeddedPageTitle" className="text-sm font-medium">
                Page Title
              </Label>
              <Input
                id="embeddedPageTitle"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Enter page title..."
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleCreatePage}
              disabled={!pageTitle.trim() || !convertedContent}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Page from Document
            </Button>
          </div>
        )}

        {/* Simple Preview */}
        {convertedContent && (
          <div className="border rounded-lg p-4 bg-white max-h-60 overflow-y-auto">
            <div className="text-sm text-gray-600 mb-2">Preview:</div>
            <div dangerouslySetInnerHTML={{ __html: generateCanvasHTML(convertedContent, layoutOptions) }} />
          </div>
        )}
      </div>
    );
  }

  // Full converter interface for standalone use
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
      {/* Left Panel - Controls */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isConverting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isConverting ? 'Converting...' : 'Upload Document'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fileName && (
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  {fileName}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Page Section */}
        {convertedContent && onCreatePage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Wiki Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pageTitle" className="text-sm font-medium">
                  Page Title
                </Label>
                <Input
                  id="pageTitle"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleCreatePage}
                disabled={!pageTitle.trim() || !convertedContent}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Page from Converted Content
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Layout Options */}
        <LayoutOptions 
          layoutOptions={layoutOptions}
          setLayoutOptions={setLayoutOptions}
        />

        {/* Download Button */}
        {convertedContent && (
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={downloadHTML}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Canvas HTML
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:col-span-2 bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium">Canvas LMS Preview</h3>
        </div>
        <div 
          className="p-4 overflow-y-auto"
          style={{ minHeight: '600px', minWidth: '800px' }}
        >
          {convertedContent ? (
            <div dangerouslySetInnerHTML={{ __html: generateCanvasHTML(convertedContent, layoutOptions) }} />
          ) : (
            <div className="text-center text-gray-500 py-20">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Upload a document to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
