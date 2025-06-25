
import React from 'react';
import { CourseData } from '../CourseCreator';
import { FrontPageMetadata } from './frontpage/FrontPageMetadata';
import { CourseInfoSummary } from './frontpage/CourseInfoSummary';
import { FrontPageContentGenerator } from './frontpage/FrontPageContentGenerator';
import { FrontPageContentEditor } from './frontpage/FrontPageContentEditor';
import { FrontPagePreview } from './frontpage/FrontPagePreview';
import { generateDefaultFrontPageContent } from './frontpage/utils';

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

  const handleGenerateDefaultContent = () => {
    const defaultContent = generateDefaultFrontPageContent(courseData);
    updateFrontPage('content', defaultContent);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FrontPageMetadata
            courseData={courseData}
            onUpdateFrontPage={updateFrontPage}
          />
          <FrontPageContentGenerator
            courseData={courseData}
            onGenerateDefaultContent={handleGenerateDefaultContent}
          />
        </div>

        <CourseInfoSummary courseData={courseData} />
      </div>

      <FrontPageContentEditor
        courseData={courseData}
        onUpdateFrontPage={updateFrontPage}
      />

      <FrontPagePreview content={courseData.frontPage.content} />
    </div>
  );
};
