
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FrontPagePreviewProps {
  content: string;
}

export const FrontPagePreview: React.FC<FrontPagePreviewProps> = ({
  content
}) => {
  if (!content) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Front Page Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none border rounded p-4 bg-white"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
};
