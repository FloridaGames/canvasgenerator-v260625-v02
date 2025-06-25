
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WikiPage } from '../CourseCreator';
import { PageItem } from './PageItem';

interface PagesListProps {
  pages: WikiPage[];
  onUpdatePage: (pageId: string, updates: Partial<WikiPage>) => void;
  onDeletePage: (pageId: string) => void;
  onMovePageUp: (index: number) => void;
  onMovePageDown: (index: number) => void;
}

export const PagesList: React.FC<PagesListProps> = ({
  pages,
  onUpdatePage,
  onDeletePage,
  onMovePageUp,
  onMovePageDown
}) => {
  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No pages created yet. Create your first page above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Wiki Pages ({pages.length})</CardTitle>
          <div className="text-sm text-gray-600">
            Pages will be included in the IMSCC export
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div key={page.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <h3 className="font-medium text-gray-900">{page.title}</h3>
                  {!page.isPublished && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </div>
              
              <PageItem
                page={page}
                index={index}
                totalPages={pages.length}
                onUpdate={onUpdatePage}
                onDelete={onDeletePage}
                onMoveUp={onMovePageUp}
                onMoveDown={onMovePageDown}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
