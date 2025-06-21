
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseData } from '../CourseCreator';
import { generateIMSCC } from '@/utils/imsccGenerator';

interface IMSCCExporterProps {
  courseData: CourseData;
}

export const IMSCCExporter: React.FC<IMSCCExporterProps> = ({ courseData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const imsccBlob = await generateIMSCC(courseData);
      const url = URL.createObjectURL(imsccBlob);
      setDownloadUrl(url);
      
      // Auto-download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${courseData.code || 'course'}-${Date.now()}.imscc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating IMSCC:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Course Title:</span>
                <p className="text-gray-900">{courseData.title || 'Not set'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Course Code:</span>
                <p className="text-gray-900">{courseData.code || 'Not set'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Term:</span>
                <p className="text-gray-900">{courseData.term || 'Not set'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Total Pages:</span>
                <p className="text-gray-900">{courseData.pages.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Published Pages:</span>
                <p className="text-gray-900">{courseData.pages.filter(p => p.isPublished).length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Front Page:</span>
                <p className="text-gray-900">{courseData.frontPage.title || 'Not set'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page List</CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.pages.length === 0 ? (
            <p className="text-gray-500">No pages created</p>
          ) : (
            <div className="space-y-2">
              {courseData.pages.map((page, index) => (
                <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{page.title}</span>
                    {!page.isPublished && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {page.content.length} chars
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Export to Canvas LMS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-800">
              Your course is ready to be exported as an IMSCC package that can be imported into Canvas LMS. 
              The package will include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Course metadata and settings</li>
              <li>Custom front page with navigation</li>
              <li>All wiki pages with proper Canvas formatting</li>
              <li>Module structure for organized content</li>
            </ul>
            
            <div className="pt-4">
              <Button
                onClick={handleExport}
                disabled={isGenerating || !courseData.title || !courseData.code}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                size="lg"
              >
                {isGenerating ? 'Generating IMSCC Package...' : 'Download IMSCC Package'}
              </Button>
            </div>
            
            {downloadUrl && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 text-sm">
                  ✅ IMSCC package generated successfully! The download should start automatically.
                </p>
              </div>
            )}
            
            <div className="mt-4 text-xs text-blue-700">
              <p><strong>Import Instructions:</strong></p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Go to your Canvas course</li>
                <li>Navigate to Settings → Import Existing Content</li>
                <li>Choose "Common Cartridge 1.x Package"</li>
                <li>Upload the downloaded .imscc file</li>
                <li>Select content to import and click "Import"</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
