
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { WikiPage } from '../CourseCreator';

interface PageItemProps {
  page: WikiPage;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<WikiPage>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const PageItem: React.FC<PageItemProps> = ({
  page,
  index,
  isFirst,
  isLast,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
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
                onChange={(e) => onUpdate({ title: e.target.value })}
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
                onCheckedChange={(checked) => onUpdate({ isPublished: checked })}
              />
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
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
                onChange={(e) => onUpdate({ content: e.target.value })}
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
