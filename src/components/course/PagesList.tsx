
import React, { useState } from 'react';
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
  const [editingPage, setEditingPage] = useState<string | null>(null);

  if (pages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No pages created yet. Add your first page above or upload documents to create pages!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Course Pages ({pages.length})
      </h3>
      
      {pages.map((page, index) => (
        <PageItem
          key={page.id}
          page={page}
          index={index}
          isFirst={index === 0}
          isLast={index === pages.length - 1}
          isEditing={editingPage === page.id}
          onEdit={() => setEditingPage(editingPage === page.id ? null : page.id)}
          onUpdate={(updates) => onUpdatePage(page.id, updates)}
          onDelete={() => onDeletePage(page.id)}
          onMoveUp={() => onMovePageUp(index)}
          onMoveDown={() => onMovePageDown(index)}
        />
      ))}
    </div>
  );
};
