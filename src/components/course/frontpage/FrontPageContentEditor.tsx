
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseData } from '../../CourseCreator';

interface FrontPageContentEditorProps {
  courseData: CourseData;
  onUpdateFrontPage: (field: keyof CourseData['frontPage'], value: string) => void;
}

export const FrontPageContentEditor: React.FC<FrontPageContentEditorProps> = ({
  courseData,
  onUpdateFrontPage
}) => {
  return (
    <div>
      <Label htmlFor="frontContent" className="text-sm font-medium text-gray-700">
        Front Page Content (HTML) *
      </Label>
      <Textarea
        id="frontContent"
        value={courseData.frontPage.content}
        onChange={(e) => onUpdateFrontPage('content', e.target.value)}
        rows={12}
        className="mt-1 font-mono text-sm"
        placeholder="Enter your HTML content for the front page..."
      />
    </div>
  );
};
