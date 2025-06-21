
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseMetadata } from './course/CourseMetadata';
import { PageManager } from './course/PageManager';
import { FrontPageDesigner } from './course/FrontPageDesigner';
import { IMSCCExporter } from './course/IMSCCExporter';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
}

export interface CourseData {
  title: string;
  description: string;
  code: string;
  term: string;
  startDate: string;
  endDate: string;
  frontPage: {
    title: string;
    content: string;
    welcomeMessage: string;
  };
  pages: WikiPage[];
}

const steps = [
  { id: 'metadata', title: 'Course Details', description: 'Basic course information' },
  { id: 'pages', title: 'Wiki Pages', description: 'Create and manage content pages' },
  { id: 'frontpage', title: 'Front Page', description: 'Design course homepage' },
  { id: 'export', title: 'Export', description: 'Generate IMSCC package' }
];

export const CourseCreator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    code: '',
    term: '',
    startDate: '',
    endDate: '',
    frontPage: {
      title: 'Welcome to the Course',
      content: '',
      welcomeMessage: 'Welcome to our learning journey!'
    },
    pages: []
  });

  const updateCourseData = (updates: Partial<CourseData>) => {
    setCourseData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return courseData.title && courseData.code;
      case 1:
        return courseData.pages.length > 0;
      case 2:
        return courseData.frontPage.title && courseData.frontPage.content;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'metadata':
        return <CourseMetadata courseData={courseData} updateCourseData={updateCourseData} />;
      case 'pages':
        return <PageManager courseData={courseData} updateCourseData={updateCourseData} />;
      case 'frontpage':
        return <FrontPageDesigner courseData={courseData} updateCourseData={updateCourseData} />;
      case 'export':
        return <IMSCCExporter courseData={courseData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
