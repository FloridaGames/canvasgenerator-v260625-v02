import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseData, WikiPage, UploadedDocument } from '../CourseCreator';
import { DocumentUpload } from './DocumentUpload';
import { ChevronUp, ChevronDown, FileText } from 'lucide-react';

interface PageManagerProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const PageManager: React.FC<PageManagerProps> = ({
  courseData,
  updateCourseData
}) => {
  const [newPageTitle, setNewPageTitle] = useState('');
  const [editingPage, setEditingPage] = useState<string | null>(null);

  const addPage = () => {
    if (!newPageTitle.trim()) return;

    const newPage: WikiPage = {
      id: Date.now().toString(),
      title: newPageTitle,
      content: `<h1>${newPageTitle}</h1>\n<p>Add your content here...</p>`,
      order: courseData.pages.length + 1,
      isPublished: true
    };

    updateCourseData({
      pages: [...courseData.pages, newPage]
    });
    setNewPageTitle('');
  };

  const addPageFromDocument = (document: UploadedDocument) => {
    const newPage: WikiPage = {
      id: Date.now().toString(),
      title: document.name.replace(/\.[^/.]+$/, ""), // Remove file extension
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
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages">Wiki Pages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages" className="space-y-6">
          {/* Add New Page */}
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
                    onClick={addPage}
                    disabled={!newPageTitle.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Pages from Documents */}
          {courseData.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Pages from Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addPageFromDocument(doc)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Create Page
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Pages */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Course Pages ({courseData.pages.length})
            </h3>
            
            {courseData.pages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pages created yet. Add your first page above or upload documents to create pages!</p>
              </div>
            ) : (
              courseData.pages.map((page, index) => (
                <Card key={page.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{page.order}
                        </span>
                        {editingPage === page.id ? (
                          <Input
                            value={page.title}
                            onChange={(e) => updatePage(page.id, { title: e.target.value })}
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
                            onCheckedChange={(checked) => updatePage(page.id, { isPublished: checked })}
                          />
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => movePageUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => movePageDown(index)}
                            disabled={index === courseData.pages.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPage(editingPage === page.id ? null : page.id)}
                        >
                          {editingPage === page.id ? 'Save' : 'Edit'}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePage(page.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {editingPage === page.id && (
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Page Content (HTML)
                          </Label>
                          <Textarea
                            value={page.content}
                            onChange={(e) => updatePage(page.id, { content: e.target.value })}
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
              ))
            )}
          </div>
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
