
import React from 'react';
import { CourseData } from '../../CourseCreator';

interface FrontPageContentGeneratorProps {
  courseData: CourseData;
  onGenerateDefaultContent: () => void;
}

export const FrontPageContentGenerator: React.FC<FrontPageContentGeneratorProps> = ({
  onGenerateDefaultContent
}) => {
  return (
    <div className="pt-4">
      <button
        onClick={onGenerateDefaultContent}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Generate Default Front Page
      </button>
    </div>
  );
};
