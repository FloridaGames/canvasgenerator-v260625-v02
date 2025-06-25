
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WikiPage } from '../CourseCreator';
import { PageItem } from './PageItem';
import { Download, FileDown } from 'lucide-react';
import { downloadWikiPageHTML, downloadAllWikiPagesHTML } from '@/utils/wikiPageGenerator';

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
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      downloadAllWikiPagesHTML(pages);
    } catch (error) {
      console.error('Error downloading pages:', error);
    } finally {
      setTimeout(() => setIsDownloadingAll(false), 1000);
    }
  };

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll || pages.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloadingAll ? 'Downloading...' : 'Download All HTML'}
            </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadWikiPageHTML(page)}
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download HTML
                </Button>
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
