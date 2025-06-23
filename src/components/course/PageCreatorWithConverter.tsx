
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from 'lucide-react';
import { DocumentConverter } from './DocumentConverter';
import { LayoutOptions, LayoutOptionsData } from './LayoutOptions';
import { generateCanvasHTML } from '@/utils/canvasLayoutGenerator';

interface PageCreatorWithConverterProps {
  onAddPage: (title: string, content?: string) => void;
  onAddPageFromConverter: (title: string, content: string) => void;
}

export const PageCreatorWithConverter: React.FC<PageCreatorWithConverterProps> = ({
  onAddPage,
  onAddPageFromConverter
}) => {
  const [newPageTitle, setNewPageTitle] = useState('');
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptionsData>({
    contentWidth: '100%',
    contentAlignment: 'center',
    columns: 1,
    columnWidths: [12],
    textAlign: 'left'
  });

  const handleAddBlankPage = () => {
    if (!newPageTitle.trim()) return;
    
    const defaultContent = `<h1>${newPageTitle}</h1>\n<p>Add your content here...</p>`;
    const formattedContent = generateCanvasHTML(defaultContent, layoutOptions);
    
    onAddPage(newPageTitle, formattedContent);
    setNewPageTitle('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create New Wiki Page</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="blank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Blank Page
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              From Document
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="blank" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="pageTitle" className="text-sm font-medium text-gray-700">
                  Page Title
                </Label>
                <Input
                  id="pageTitle"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddBlankPage}
                  disabled={!newPageTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Blank Page
                </Button>
              </div>
            </div>
            
            <LayoutOptions 
              layoutOptions={layoutOptions}
              setLayoutOptions={setLayoutOptions}
            />
            
            {newPageTitle && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">Preview:</div>
                <div 
                  className="bg-white p-4 rounded border min-h-32"
                  dangerouslySetInnerHTML={{ 
                    __html: generateCanvasHTML(`<h1>${newPageTitle}</h1>\n<p>Add your content here...</p>`, layoutOptions) 
                  }} 
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="document" className="mt-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <DocumentConverter 
                onCreatePage={onAddPageFromConverter}
                isEmbedded={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
