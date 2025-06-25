
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseData } from '../CourseCreator';
import { generateCanvasHTML } from '@/utils/canvasLayoutGenerator';
import { LayoutOptions, LayoutOptionsData } from './LayoutOptions';

interface FrontPageWizardProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const FrontPageWizard: React.FC<FrontPageWizardProps> = ({
  courseData,
  updateCourseData
}) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptionsData>({
    contentWidth: '100%',
    contentAlignment: 'center',
    columns: 1,
    columnWidths: [12],
    textAlign: 'left'
  });

  const updateFrontPage = (field: keyof CourseData['frontPage'], value: string) => {
    updateCourseData({
      frontPage: {
        ...courseData.frontPage,
        [field]: value
      }
    });
  };

  const generateWelcomeContent = () => {
    const content = `
<div class="course-welcome">
  <h1>${courseData.frontPage.title}</h1>
  <p class="welcome-message">${courseData.frontPage.welcomeMessage}</p>
  
  <div class="course-overview">
    <h2>Course Overview</h2>
    <p><strong>Course:</strong> ${courseData.title}</p>
    <p><strong>Course Code:</strong> ${courseData.code}</p>
    ${courseData.term ? `<p><strong>Term:</strong> ${courseData.term}</p>` : ''}
    ${courseData.startDate ? `<p><strong>Start Date:</strong> ${new Date(courseData.startDate).toLocaleDateString()}</p>` : ''}
    ${courseData.endDate ? `<p><strong>End Date:</strong> ${new Date(courseData.endDate).toLocaleDateString()}</p>` : ''}
  </div>
</div>
    `.trim();
    
    const formattedContent = generateCanvasHTML(content, layoutOptions);
    updateFrontPage('content', formattedContent);
    setActiveTab('preview');
  };

  const generateNavigationContent = () => {
    const publishedPages = courseData.pages.filter(page => page.isPublished);
    
    const content = `
<div class="course-navigation">
  <h1>${courseData.frontPage.title}</h1>
  <p class="welcome-message">${courseData.frontPage.welcomeMessage}</p>
  
  <div class="course-pages">
    <h2>Course Content</h2>
    <div class="page-grid">
      ${publishedPages.map(page => `
        <div class="page-card">
          <h3><a href="/courses/${courseData.code}/pages/${page.title.toLowerCase().replace(/\s+/g, '-')}">${page.title}</a></h3>
          <p>Click to access this page content</p>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="getting-started">
    <h2>Getting Started</h2>
    <p>Welcome to ${courseData.title}! Navigate through the course pages above to access your learning materials.</p>
  </div>
</div>
    `.trim();
    
    const formattedContent = generateCanvasHTML(content, layoutOptions);
    updateFrontPage('content', formattedContent);
    setActiveTab('preview');
  };

  const canProceed = () => {
    switch (activeTab) {
      case 'setup':
        return courseData.frontPage.title && courseData.frontPage.welcomeMessage;
      case 'layout':
        return true;
      case 'content':
        return courseData.frontPage.content;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Front Page Creation Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frontTitle">Front Page Title *</Label>
                  <Input
                    id="frontTitle"
                    value={courseData.frontPage.title}
                    onChange={(e) => updateFrontPage('title', e.target.value)}
                    placeholder="Welcome to the Course"
                  />
                </div>
                
                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message *</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={courseData.frontPage.welcomeMessage}
                    onChange={(e) => updateFrontPage('welcomeMessage', e.target.value)}
                    placeholder="Welcome to our learning journey!"
                    rows={3}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Course Information</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><strong>Course:</strong> {courseData.title || 'Not set'}</p>
                    <p><strong>Code:</strong> {courseData.code || 'Not set'}</p>
                    <p><strong>Pages:</strong> {courseData.pages.filter(p => p.isPublished).length} published</p>
                  </div>
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
                  onClick={generateWelcomeContent}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!canProceed()}
                >
                  Generate Welcome Page
                </Button>
                
                <Button 
                  onClick={generateNavigationContent}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!canProceed() || courseData.pages.length === 0}
                >
                  Generate Navigation Page
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="frontContent">Front Page HTML Content</Label>
                <Textarea
                  id="frontContent"
                  value={courseData.frontPage.content}
                  onChange={(e) => updateFrontPage('content', e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Enter your HTML content or use the Layout tab to generate content..."
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Front Page Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {courseData.frontPage.content ? (
                    <div 
                      className="prose prose-sm max-w-none border rounded p-4 bg-white min-h-96"
                      dangerouslySetInnerHTML={{ __html: courseData.frontPage.content }}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No content generated yet. Use the Layout tab to create content.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
