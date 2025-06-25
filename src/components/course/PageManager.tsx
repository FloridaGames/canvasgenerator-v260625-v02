import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseData, WikiPage, UploadedDocument } from '../CourseCreator';
import { DocumentUpload } from './DocumentUpload';
import { PageCreationWizard } from './PageCreationWizard';
import { CreatePagesFromDocuments } from './CreatePagesFromDocuments';
import { PagesList } from './PagesList';

interface PageManagerProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const PageManager: React.FC<PageManagerProps> = ({
  courseData,
  updateCourseData
}) => {
  const addPage = (title: string, content?: string) => {
    const defaultContent = content || `<h1>${title}</h1>\n<p>Add your content here...</p>`;
    
    const newPage: WikiPage = {
      id: Date.now().toString(),
      title,
      content: defaultContent,
      order: courseData.pages.length + 1,
      isPublished: true
    };

    updateCourseData({
      pages: [...courseData.pages, newPage]
    });
  };

  const addPageFromDocument = (document: UploadedDocument) => {
    const newPage: WikiPage = {
      id: Date.now().toString(),
      title: document.name.replace(/\.[^/.]+$/, ""),
      content: `<h1>${document.name.replace(/\.[^/.]+$/, "")}</h1>
<div class="document-content">
  <p><strong>Document:</strong> ${document.name}</p>
  <p>This page was created from an uploaded document. You can edit the content below or add additional information.</p>
  
  <div class="document-link">
    <a href="#" class="btn btn-primary">Download ${document.name}</a>
  </div>
</div>

<h2>Document Content</h2>
<p>Add the document content or description here...</p>`,
      order: courseData.pages.length + 1,
      isPublished: true
    };

    updateCourseData({
      pages: [...courseData.pages, newPage]
    });
  };

  const addPageFromConverter = (title: string, content: string) => {
    const newPage: WikiPage = {
      id: Date.now().toString(),
      title,
      content,
      order: courseData.pages.length + 1,
      isPublished: true
    };

    updateCourseData({
      pages: [...courseData.pages, newPage]
    });
  };

  const handleDocumentUpload = (document: UploadedDocument) => {
    updateCourseData({
      documents: [...courseData.documents, document]
    });
  };

  const handleDocumentRemove = (documentId: string) => {
    const documentToRemove = courseData.documents.find(d => d.id === documentId);
    if (documentToRemove) {
      URL.revokeObjectURL(documentToRemove.url);
    }
    
    updateCourseData({
      documents: courseData.documents.filter(d => d.id !== documentId)
    });
  };

  const updatePage = (pageId: string, updates: Partial<WikiPage>) => {
    const updatedPages = courseData.pages.map(page =>
      page.id === pageId ? { ...page, ...updates } : page
    );
    updateCourseData({ pages: updatedPages });
  };

  const deletePage = (pageId: string) => {
    const updatedPages = courseData.pages.filter(page => page.id !== pageId);
    updateCourseData({ pages: updatedPages });
  };

  const movePageUp = (index: number) => {
    if (index === 0) return;
    const pages = [...courseData.pages];
    [pages[index], pages[index - 1]] = [pages[index - 1], pages[index]];
    pages.forEach((page, i) => page.order = i + 1);
    updateCourseData({ pages });
  };

  const movePageDown = (index: number) => {
    if (index === courseData.pages.length - 1) return;
    const pages = [...courseData.pages];
    [pages[index], pages[index + 1]] = [pages[index + 1], pages[index]];
    pages.forEach((page, i) => page.order = i + 1);
    updateCourseData({ pages });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Pages</TabsTrigger>
          <TabsTrigger value="manage">Manage Pages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6">
          <PageCreationWizard 
            onAddPage={addPage}
            onAddPageFromConverter={addPageFromConverter}
          />
          
          <CreatePagesFromDocuments
            documents={courseData.documents}
            onCreatePageFromDocument={addPageFromDocument}
          />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-6">
          <PagesList
            pages={courseData.pages}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
            onMovePageUp={movePageUp}
            onMovePageDown={movePageDown}
          />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <DocumentUpload
            onDocumentUpload={handleDocumentUpload}
            uploadedDocuments={courseData.documents}
            onDocumentRemove={handleDocumentRemove}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
