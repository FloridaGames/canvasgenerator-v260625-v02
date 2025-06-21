
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download } from 'lucide-react';
import mammoth from 'mammoth';

interface ColumnConfig {
  width: number;
  content: string;
}

interface LayoutOptions {
  contentWidth: '100%' | '800px' | '600px' | '400px';
  contentAlignment: 'left' | 'center' | 'right';
  columns: number;
  columnWidths: number[];
  textAlign: 'left' | 'center' | 'right';
}

export const DocumentConverter: React.FC = () => {
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptions>({
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

  const updateColumnWidths = (columnIndex: number, width: number) => {
    const newWidths = [...layoutOptions.columnWidths];
    newWidths[columnIndex] = width;
    
    // Ensure total doesn't exceed 12
    const total = newWidths.reduce((sum, w) => sum + w, 0);
    if (total <= 12) {
      setLayoutOptions(prev => ({ ...prev, columnWidths: newWidths }));
    }
  };

  const setColumnsCount = (count: number) => {
    const defaultWidth = Math.floor(12 / count);
    const remainder = 12 % count;
    const newWidths = Array(count).fill(defaultWidth);
    
    // Distribute remainder
    for (let i = 0; i < remainder; i++) {
      newWidths[i]++;
    }
    
    setLayoutOptions(prev => ({ 
      ...prev, 
      columns: count, 
      columnWidths: newWidths 
    }));
  };

  const generateCanvasHTML = () => {
    if (!convertedContent) return '';

    const { contentWidth, contentAlignment, columns, columnWidths, textAlign } = layoutOptions;
    
    // Calculate flex basis for columns
    const getFlexBasis = (colWidth: number) => {
      const percentage = (colWidth / 12) * 100;
      return `calc(${percentage}% - 24px)`;
    };

    const containerStyle = `
      max-width: ${contentWidth};
      margin: 0 ${contentAlignment === 'center' ? 'auto' : contentAlignment === 'right' ? '0 0 0 auto' : '0 auto 0 0'};
      padding: 20px;
    `;

    if (columns === 1) {
      return `
        <div style="${containerStyle}">
          <div style="text-align: ${textAlign};">
            ${convertedContent}
          </div>
        </div>
      `;
    }

    const columnContent = convertedContent.split('</p>').filter(p => p.trim());
    const contentPerColumn = Math.ceil(columnContent.length / columns);
    
    const columnsHTML = columnWidths.map((width, index) => {
      const startIndex = index * contentPerColumn;
      const endIndex = startIndex + contentPerColumn;
      const columnContentSlice = columnContent.slice(startIndex, endIndex).join('</p>') + (columnContent.slice(startIndex, endIndex).length > 0 ? '</p>' : '');
      
      return `
        <div class="col-xs-12 col-md-${width}" style="flex: 1 1 ${getFlexBasis(width)}; background: #f5f5f5; padding: 20px; border: 1px solid #ccc; border-radius: 10px; min-height: 420px; text-align: ${textAlign}; margin: 12px;">
          ${columnContentSlice || '<p>Column content will appear here...</p>'}
        </div>
      `;
    }).join('');

    return `
      <div style="${containerStyle}">
        <div class="grid-row" style="display: flex; flex-wrap: wrap; justify-content: center;">
          ${columnsHTML}
        </div>
      </div>
    `;
  };

  const downloadHTML = () => {
    const html = generateCanvasHTML();
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

        {/* Layout Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layout Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Width */}
            <div>
              <Label className="text-sm font-medium">Content Width</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['100%', '800px', '600px', '400px'] as const).map((width) => (
                  <Button
                    key={width}
                    variant={layoutOptions.contentWidth === width ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayoutOptions(prev => ({ ...prev, contentWidth: width }))}
                  >
                    {width}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Alignment */}
            <div>
              <Label className="text-sm font-medium">Content Alignment</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <Button
                    key={align}
                    variant={layoutOptions.contentAlignment === align ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayoutOptions(prev => ({ ...prev, contentAlignment: align }))}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <Label className="text-sm font-medium">Text Alignment</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <Button
                    key={align}
                    variant={layoutOptions.textAlign === align ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayoutOptions(prev => ({ ...prev, textAlign: align }))}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Number of Columns */}
            <div>
              <Label className="text-sm font-medium">Number of Columns</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1, 2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    variant={layoutOptions.columns === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColumnsCount(count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Column Width Configuration */}
            {layoutOptions.columns > 1 && (
              <div>
                <Label className="text-sm font-medium">Column Widths (12-Grid System)</Label>
                <div className="space-y-2 mt-2">
                  {layoutOptions.columnWidths.map((width, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Label className="text-xs w-16">Col {index + 1}:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={width}
                        onChange={(e) => updateColumnWidths(index, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-xs text-gray-500">/12</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500">
                    Total: {layoutOptions.columnWidths.reduce((sum, w) => sum + w, 0)}/12
                  </div>
                </div>
              </div>
            )}

            {/* Download Button */}
            {convertedContent && (
              <Button 
                onClick={downloadHTML}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Canvas HTML
              </Button>
            )}
          </CardContent>
        </Card>
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
            <div dangerouslySetInnerHTML={{ __html: generateCanvasHTML() }} />
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
