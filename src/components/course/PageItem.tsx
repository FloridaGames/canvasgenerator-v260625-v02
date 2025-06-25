
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { WikiPage } from '../CourseCreator';

interface PageItemProps {
  page: WikiPage;
  index: number;
  totalPages: number;
  onUpdate: (pageId: string, updates: Partial<WikiPage>) => void;
  onDelete: (pageId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const PageItem: React.FC<PageItemProps> = ({
  page,
  index,
  totalPages,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = (updates: Partial<WikiPage>) => {
    onUpdate(page.id, updates);
  };

  const handleDelete = () => {
    onDelete(page.id);
  };

  const handleMoveUp = () => {
    onMoveUp(index);
  };

  const handleMoveDown = () => {
    onMoveDown(index);
  };

  const isFirst = index === 0;
  const isLast = index === totalPages - 1;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500">
              #{page.order}
            </span>
            {isEditing ? (
              <Input
                value={page.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="text-lg font-semibold"
              />
            ) : (
              <h4 className="text-lg font-semibold text-gray-900">
                {page.title}
              </h4>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor={`published-${page.id}`} className="text-sm">
                Published
              </Label>
              <Switch
                id={`published-${page.id}`}
                checked={page.isPublished}
                onCheckedChange={(checked) => handleUpdate({ isPublished: checked })}
              />
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isEditing && (
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Page Content (HTML)
              </Label>
              <Textarea
                value={page.content}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                rows={8}
                className="mt-1 font-mono text-sm"
                placeholder="Enter your HTML content here..."
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <Label className="text-sm font-medium text-gray-700 block mb-2">
                Preview
              </Label>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
