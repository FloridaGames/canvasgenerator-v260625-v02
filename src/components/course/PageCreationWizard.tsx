
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, FileText, Upload } from 'lucide-react';
import { generateCanvasHTML } from '@/utils/canvasLayoutGenerator';
import { LayoutOptions, LayoutOptionsData } from './LayoutOptions';
import { DocumentConverter } from './DocumentConverter';

interface PageCreationWizardProps {
  onAddPage: (title: string, content: string) => void;
  onAddPageFromConverter: (title: string, content: string) => void;
}

export const PageCreationWizard: React.FC<PageCreationWizardProps> = ({
  onAddPage,
  onAddPageFromConverter
}) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptionsData>({
    contentWidth: '100%',
    contentAlignment: 'center',
    columns: 1,
    columnWidths: [12],
    textAlign: 'left'
  });

  const generateBasicContent = () => {
    const content = `
<div class="page-content">
  <h1>${pageTitle}</h1>
  <p>This is a new page in your course. Add your content below:</p>
  
  <div class="content-section">
    <h2>Introduction</h2>
    <p>Provide an introduction to the topic covered in this page.</p>
  </div>
  
  <div class="content-section">
    <h2>Main Content</h2>
    <p>Add your main content here. This could include:</p>
    <ul>
      <li>Learning objectives</li>
      <li>Key concepts</li>
      <li>Examples and illustrations</li>
      <li>Practice exercises</li>
    </ul>
  </div>
  
  <div class="content-section">
    <h2>Summary</h2>
    <p>Summarize the key points covered in this page.</p>
  </div>
</div>
    `.trim();
    
    const formattedContent = generateCanvasHTML(content, layoutOptions);
    setPageContent(formattedContent);
    setActiveTab('content');
  };

  const generateLessonContent = () => {
    const content = `
<div class="lesson-content">
  <h1>${pageTitle}</h1>
  
  <div class="lesson-objectives">
    <h2>Learning Objectives</h2>
    <p>By the end of this lesson, you will be able to:</p>
    <ul>
      <li>Objective 1</li>
      <li>Objective 2</li>
      <li>Objective 3</li>
    </ul>
  </div>
  
  <div class="lesson-content-main">
    <h2>Lesson Content</h2>
    <p>Add your lesson content here...</p>
    
    <h3>Key Concepts</h3>
    <p>Explain the main concepts...</p>
    
    <h3>Examples</h3>
    <p>Provide relevant examples...</p>
  </div>
  
  <div class="lesson-activities">
    <h2>Activities</h2>
    <p>Include practice activities or exercises...</p>
  </div>
  
  <div class="lesson-resources">
    <h2>Additional Resources</h2>
    <ul>
      <li>Resource 1</li>
      <li>Resource 2</li>
    </ul>
  </div>
</div>
    `.trim();
    
    const formattedContent = generateCanvasHTML(content, layoutOptions);
    setPageContent(formattedContent);
    setActiveTab('content');
  };

  const handleCreatePage = () => {
    if (pageTitle.trim() && pageContent.trim()) {
      onAddPage(pageTitle, pageContent);
      // Reset form
      setPageTitle('');
      setPageContent('');
      setActiveTab('setup');
    }
  };

  const canProceed = () => {
    switch (activeTab) {
      case 'setup':
        return pageTitle.trim() !== '';
      case 'layout':
        return true;
      case 'content':
        return pageContent.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Creation Wizard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageTitle">Page Title *</Label>
                <Input
                  id="pageTitle"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter page title..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Create a structured page for your course content. You can generate different types of content 
                  or upload documents to convert them into Canvas-ready pages.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <LayoutOptions 
              layoutOptions={layoutOptions}
              setLayoutOptions={setLayoutOptions}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={generateBasicContent}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!canProceed()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Basic Page
              </Button>
              
              <Button 
                onClick={generateLessonContent}
                className="bg-green-600 hover:bg-green-700"
                disabled={!canProceed()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Lesson Page
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="pageContentTextarea">Page Content (HTML)</Label>
              <Textarea
                id="pageContentTextarea"
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter your HTML content or use the Layout tab to generate content..."
              />
            </div>
            
            <Button 
              onClick={handleCreatePage}
              disabled={!canProceed()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Create Page
            </Button>
          </TabsContent>
          
          <TabsContent value="document" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-4">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="font-medium">Convert Document to Page</h3>
              </div>
              <DocumentConverter 
                onCreatePage={onAddPageFromConverter}
                isEmbedded={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {pageContent ? (
                  <div 
                    className="prose prose-sm max-w-none border rounded p-4 bg-white min-h-96"
                    dangerouslySetInnerHTML={{ __html: pageContent }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No content generated yet. Use the Layout tab to create content or the Document tab to convert a document.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {pageContent && (
              <Button 
                onClick={handleCreatePage}
                disabled={!pageTitle.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Page: {pageTitle}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
