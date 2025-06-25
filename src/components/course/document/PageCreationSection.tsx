
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

interface PageCreationSectionProps {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  onCreatePage: () => void;
  hasContent: boolean;
  isEmbedded?: boolean;
}

export const PageCreationSection: React.FC<PageCreationSectionProps> = ({
  pageTitle,
  setPageTitle,
  onCreatePage,
  hasContent,
  isEmbedded = false
}) => {
  const inputId = isEmbedded ? 'embeddedPageTitle' : 'pageTitle';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={inputId} className="text-sm font-medium">
          Page Title
        </Label>
        <Input
          id={inputId}
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder="Enter page title..."
          className="mt-1"
        />
      </div>
      <Button 
        onClick={onCreatePage}
        disabled={!pageTitle.trim() || !hasContent}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        {isEmbedded ? 'Create Page from Document' : 'Create Page from Converted Content'}
      </Button>
    </div>
  );
};
