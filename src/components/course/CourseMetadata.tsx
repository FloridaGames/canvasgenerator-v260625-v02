
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseData } from '../CourseCreator';

interface CourseMetadataProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const CourseMetadata: React.FC<CourseMetadataProps> = ({
  courseData,
  updateCourseData
}) => {
  const handleInputChange = (field: keyof CourseData, value: string) => {
    updateCourseData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Course Title *
          </Label>
          <Input
            id="title"
            value={courseData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Introduction to Computer Science"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium text-gray-700">
            Course Code *
          </Label>
          <Input
            id="code"
            value={courseData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="CS 101"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term" className="text-sm font-medium text-gray-700">
            Term
          </Label>
          <Input
            id="term"
            value={courseData.term}
            onChange={(e) => handleInputChange('term', e.target.value)}
            placeholder="Fall 2024"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={courseData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={courseData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Course Description
        </Label>
        <Textarea
          id="description"
          value={courseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a comprehensive description of the course objectives, topics covered, and learning outcomes..."
          rows={4}
          className="w-full"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Course Preview</h3>
        <div className="text-sm text-blue-800">
          <p><strong>Title:</strong> {courseData.title || 'Course title will appear here'}</p>
          <p><strong>Code:</strong> {courseData.code || 'Course code will appear here'}</p>
          <p><strong>Term:</strong> {courseData.term || 'Term will appear here'}</p>
        </div>
      </div>
    </div>
  );
};
