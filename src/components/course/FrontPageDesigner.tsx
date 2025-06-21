
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseData } from '../CourseCreator';

interface FrontPageDesignerProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const FrontPageDesigner: React.FC<FrontPageDesignerProps> = ({
  courseData,
  updateCourseData
}) => {
  const updateFrontPage = (field: keyof CourseData['frontPage'], value: string) => {
    updateCourseData({
      frontPage: {
        ...courseData.frontPage,
        [field]: value
      }
    });
  };

  const generateDefaultContent = () => {
    const pagesList = courseData.pages
      .filter(page => page.isPublished)
      .map(page => `<li><a href="/courses/${courseData.code}/pages/${page.title.toLowerCase().replace(/\s+/g, '-')}">${page.title}</a></li>`)
      .join('\n');

    const defaultContent = `
<div class="course-welcome">
  <h1>${courseData.frontPage.title}</h1>
  <p class="welcome-message">${courseData.frontPage.welcomeMessage}</p>
  
  <div class="course-info">
    <h2>Course Information</h2>
    <p><strong>Course:</strong> ${courseData.title}</p>
    <p><strong>Code:</strong> ${courseData.code}</p>
    ${courseData.term ? `<p><strong>Term:</strong> ${courseData.term}</p>` : ''}
    ${courseData.description ? `<p><strong>Description:</strong> ${courseData.description}</p>` : ''}
  </div>

  <div class="course-navigation">
    <h2>Course Pages</h2>
    <ul class="page-list">
      ${pagesList}
    </ul>
  </div>

  <div class="getting-started">
    <h2>Getting Started</h2>
    <p>Welcome to the course! Please review the course pages above and familiarize yourself with the content structure.</p>
  </div>
</div>

<style>
.course-welcome {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-message {
  font-size: 1.2em;
  color: #2c5282;
  margin-bottom: 30px;
}

.course-info, .course-navigation, .getting-started {
  background: #f7fafc;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.page-list {
  list-style-type: none;
  padding: 0;
}

.page-list li {
  margin: 10px 0;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.page-list a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.page-list a:hover {
  text-decoration: underline;
}
</style>
    `.trim();

    updateFrontPage('content', defaultContent);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="frontTitle" className="text-sm font-medium text-gray-700">
              Front Page Title *
            </Label>
            <Input
              id="frontTitle"
              value={courseData.frontPage.title}
              onChange={(e) => updateFrontPage('title', e.target.value)}
              placeholder="Welcome to the Course"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700">
              Welcome Message
            </Label>
            <Textarea
              id="welcomeMessage"
              value={courseData.frontPage.welcomeMessage}
              onChange={(e) => updateFrontPage('welcomeMessage', e.target.value)}
              placeholder="Welcome to our learning journey!"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={generateDefaultContent}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Generate Default Front Page
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Page Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Course Pages:</strong> {courseData.pages.length}</p>
              <p><strong>Published Pages:</strong> {courseData.pages.filter(p => p.isPublished).length}</p>
              <div className="mt-3">
                <p className="font-medium">Pages to include:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {courseData.pages
                    .filter(page => page.isPublished)
                    .map(page => (
                      <li key={page.id} className="text-gray-600">
                        {page.title}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Label htmlFor="frontContent" className="text-sm font-medium text-gray-700">
          Front Page Content (HTML) *
        </Label>
        <Textarea
          id="frontContent"
          value={courseData.frontPage.content}
          onChange={(e) => updateFrontPage('content', e.target.value)}
          rows={12}
          className="mt-1 font-mono text-sm"
          placeholder="Enter your HTML content for the front page..."
        />
      </div>

      {courseData.frontPage.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Front Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none border rounded p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: courseData.frontPage.content }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
