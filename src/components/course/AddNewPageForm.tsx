
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WikiPage } from '../CourseCreator';

interface AddNewPageFormProps {
  onAddPage: (title: string) => void;
}

export const AddNewPageForm: React.FC<AddNewPageFormProps> = ({ onAddPage }) => {
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleAddPage = () => {
    if (!newPageTitle.trim()) return;
    onAddPage(newPageTitle);
    setNewPageTitle('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Wiki Page</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="pageTitle" className="text-sm font-medium text-gray-700">
              Page Title
            </Label>
            <Input
              id="pageTitle"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Enter page title..."
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleAddPage}
              disabled={!newPageTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
