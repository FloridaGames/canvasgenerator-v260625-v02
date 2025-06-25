
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseData } from '../../CourseCreator';

interface FrontPageMetadataProps {
  courseData: CourseData;
  onUpdateFrontPage: (field: keyof CourseData['frontPage'], value: string) => void;
}

export const FrontPageMetadata: React.FC<FrontPageMetadataProps> = ({
  courseData,
  onUpdateFrontPage
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frontTitle" className="text-sm font-medium text-gray-700">
          Front Page Title *
        </Label>
        <Input
          id="frontTitle"
          value={courseData.frontPage.title}
          onChange={(e) => onUpdateFrontPage('title', e.target.value)}
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
          onChange={(e) => onUpdateFrontPage('welcomeMessage', e.target.value)}
          placeholder="Welcome to our learning journey!"
          rows={3}
          className="mt-1"
        />
      </div>
    </div>
  );
};
