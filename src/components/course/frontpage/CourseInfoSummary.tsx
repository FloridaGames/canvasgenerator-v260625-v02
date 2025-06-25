
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseData } from '../../CourseCreator';

interface CourseInfoSummaryProps {
  courseData: CourseData;
}

export const CourseInfoSummary: React.FC<CourseInfoSummaryProps> = ({
  courseData
}) => {
  return (
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
  );
};
