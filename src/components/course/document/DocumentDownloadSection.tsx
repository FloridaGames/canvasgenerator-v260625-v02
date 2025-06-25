
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from 'lucide-react';

interface DocumentDownloadSectionProps {
  onDownload: () => void;
  hasContent: boolean;
}

export const DocumentDownloadSection: React.FC<DocumentDownloadSectionProps> = ({
  onDownload,
  hasContent
}) => {
  if (!hasContent) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <Button 
          onClick={onDownload}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Canvas HTML
        </Button>
      </CardContent>
    </Card>
  );
};
